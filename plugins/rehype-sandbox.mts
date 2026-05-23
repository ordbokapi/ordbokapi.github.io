// SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// This file is part of Ordbok API.
//
// Ordbok API is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version.
//
// Ordbok API is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
// details.
//
// You should have received a copy of the GNU Affero General Public License
// along with Ordbok API. If not, see <https://www.gnu.org/licenses/>.

import type rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type HighlighterGeneric,
  type ShikiTransformer,
} from "shiki";
import LZString from "lz-string";

type Tree = Parameters<ReturnType<typeof rehypeRaw>>[0];
type RootContent = Tree["children"][number];
type HastElement = Extract<RootContent, { type: "element" }>;
type Parent = Extract<Tree | RootContent, { children: RootContent[] }>;

interface Options {
  apiUrl?: string;
  toClass?: ShikiTransformer;
}

let highlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["graphql", "json"],
    });
  }

  return highlighterPromise;
}

function sandboxUrl(
  apiUrl: string,
  document: string,
  variables?: string,
): string {
  const state = JSON.stringify({
    document,
    ...(variables ? { variables } : {}),
  });

  return `${apiUrl}?explorerURLState=${LZString.compressToEncodedURIComponent(state)}`;
}

function getCodeContent(node: HastElement): string {
  const code = node.children[0];

  if (!("children" in code) || !code?.children) {
    return "";
  }

  return code.children
    .map((c) => ("value" in c ? (c.value ?? "") : ""))
    .join("");
}

function hasSandboxMeta(node: HastElement): boolean {
  const code = node.children[0];

  if (code?.type !== "element") {
    return false;
  }

  const meta = (code?.properties?.dataMeta as string) ?? "";

  return meta.includes("sandbox");
}

function hasLanguageClass(node: HastElement, lang: string): boolean {
  const code = node.children[0];

  if (code?.type !== "element") {
    return false;
  }

  const classes = code.properties.className;

  if (!Array.isArray(classes)) {
    return false;
  }

  return classes.includes(`language-${lang}`);
}

function isPreWithCode(node: unknown): node is HastElement {
  const el = node as HastElement | undefined;

  return (
    el?.type === "element" &&
    el.tagName === "pre" &&
    el.children?.length === 1 &&
    el.children[0]?.type === "element" &&
    el.children[0].tagName === "code"
  );
}

export default function rehypeSandbox({
  apiUrl = "https://api.ordbokapi.org/graphql",
  toClass,
}: Options = {}) {
  return async (tree: Tree) => {
    const blocks: Array<{
      node: HastElement;
      parent: Parent;
      index: number;
      query: string;
      variables?: string;
      variablesIndex?: number;
    }> = [];

    visit(tree, "element", (node, index, parent) => {
      if (!isPreWithCode(node) || index == null || !parent) {
        return;
      }

      if (!hasLanguageClass(node, "graphql") || !hasSandboxMeta(node)) {
        return;
      }

      const query = getCodeContent(node);
      let variables: string | undefined;
      let variablesIndex: number | undefined;

      // Skip whitespace text nodes to find potential variables block.
      let nextIdx = index + 1;

      while (nextIdx < parent.children.length) {
        const sibling = parent.children[nextIdx];

        if (sibling?.type === "text" && sibling.value?.trim() === "") {
          nextIdx++;
          continue;
        }

        break;
      }

      const next = parent.children[nextIdx] as unknown;

      if (
        isPreWithCode(next) &&
        hasLanguageClass(next, "json") &&
        hasSandboxMeta(next)
      ) {
        variables = getCodeContent(next);
        variablesIndex = nextIdx;
      }

      blocks.push({
        node: node as HastElement,
        parent: parent as Parent,
        index,
        query,
        variables,
        variablesIndex,
      });
    });

    if (blocks.length === 0) {
      return;
    }

    const highlighter = await getHighlighter();

    // Process in reverse order so index shifts don't affect earlier entries.
    for (const block of blocks.reverse()) {
      const queryHtml = highlighter.codeToHtml(block.query, {
        lang: "graphql",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
        transformers: [
          ...(toClass ? [toClass] : []),
          {
            pre(node) {
              delete node.properties.tabindex;
            },
          },
        ],
      });

      let variablesHtml = "";

      if (block.variables) {
        variablesHtml = highlighter.codeToHtml(block.variables, {
          lang: "json",
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
          transformers: [
            ...(toClass ? [toClass] : []),
            {
              pre(node) {
                delete node.properties.tabindex;
              },
            },
          ],
        });
      }

      const url = sandboxUrl(apiUrl, block.query, block.variables);

      const tabs = block.variables
        ? `<div class="sandbox-tabs" role="tablist">` +
          `<button type="button" role="tab" aria-selected="true" aria-controls="sandbox-panel-query-${block.index}" tabindex="0" class="sandbox-tab sandbox-tab-active">Førespurnad</button>` +
          `<button type="button" role="tab" aria-selected="false" aria-controls="sandbox-panel-vars-${block.index}" tabindex="-1" class="sandbox-tab">Variablar</button>` +
          `</div>`
        : "";

      const panels = block.variables
        ? `<div role="tabpanel" id="sandbox-panel-query-${block.index}" class="sandbox-panel">${queryHtml}</div>` +
          `<div role="tabpanel" id="sandbox-panel-vars-${block.index}" class="sandbox-panel sandbox-panel-hidden">${variablesHtml}</div>`
        : `<div class="sandbox-panel">${queryHtml}</div>`;

      const tryLink = `<a href="${url}" class="sandbox-try-link" target="_blank" rel="noopener">Prøv sjølv i Apollo Sandbox<span class="sandbox-try-icon" aria-hidden="true"></span></a>`;

      const html = `<div class="sandbox-query-block">${tabs}${panels}${tryLink}</div>`;

      // Remove variables block if present.
      if (block.variablesIndex != null) {
        block.parent.children.splice(block.variablesIndex, 1);
      }

      // Replace query block.
      block.parent.children[block.index] = {
        type: "raw",
        value: html,
      } as RootContent;
    }
  };
}
