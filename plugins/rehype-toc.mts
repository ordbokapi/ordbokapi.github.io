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

interface Heading {
  depth: number;
  id: string;
  text: string;
}

function collectText(node: {
  type: string;
  value?: string;
  children?: any[];
}): string {
  if (node.type === "text") {
    return node.value ?? "";
  }

  if (node.children) {
    return node.children.map(collectText).join("");
  }

  return "";
}

export default function rehypeToc() {
  return (tree: Parameters<ReturnType<typeof rehypeRaw>>[0]) => {
    let tocIndex: number | undefined;
    let tocParent: { children: typeof tree.children } | undefined;

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "p" || index == null || !parent) {
        return;
      }

      const children = node.children;

      if (
        children?.length === 1 &&
        children[0].type === "text" &&
        children[0].value.trim() === "[[toc]]"
      ) {
        tocIndex = index;
        tocParent = parent;
      }
    });

    if (tocIndex == null || !tocParent) {
      return;
    }

    const headings: Heading[] = [];

    visit(tree, "element", (node) => {
      const match = node.tagName.match(/^h([2-4])$/);

      if (!match) {
        return;
      }

      const depth = parseInt(match[1]);
      const id = node.properties?.id;

      if (!id || typeof id !== "string") {
        return;
      }

      const text = (node.children ?? [])
        .filter(
          (child) =>
            !(
              child.type === "element" &&
              child.tagName === "a" &&
              Array.isArray(child.properties?.className) &&
              child.properties?.className?.includes?.("heading-anchor")
            ),
        )
        .map(collectText)
        .join("");

      headings.push({ depth, id, text });
    });

    if (!headings.length) {
      return;
    }

    const minDepth = Math.min(...headings.map((h) => h.depth));

    function buildList(items: Heading[], baseDepth: number): any {
      const list: any[] = [];
      let i = 0;

      while (i < items.length) {
        const item = items[i];

        if (item.depth === baseDepth) {
          const li = {
            type: "element",
            tagName: "li",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "a",
                properties: { href: `#${item.id}` },
                children: [{ type: "text", value: item.text }],
              },
            ],
          };

          const subItems: Heading[] = [];
          i++;

          while (i < items.length && items[i].depth > baseDepth) {
            subItems.push(items[i]);
            i++;
          }

          if (subItems.length) {
            li.children.push(buildList(subItems, baseDepth + 1));
          }

          list.push(li);
        } else {
          const subItems: Heading[] = [];

          while (i < items.length && items[i].depth > baseDepth) {
            subItems.push(items[i]);
            i++;
          }

          if (subItems.length) {
            list.push({
              type: "element",
              tagName: "li",
              properties: {},
              children: [buildList(subItems, baseDepth + 1)],
            });
          }
        }
      }

      return {
        type: "element",
        tagName: "ol",
        properties: {},
        children: list,
      };
    }

    const nav = {
      type: "element" as const,
      tagName: "nav",
      properties: { className: ["toc"], ariaLabel: "Innhald" },
      children: [buildList(headings, minDepth)],
    };

    tocParent.children[tocIndex] = nav;
  };
}
