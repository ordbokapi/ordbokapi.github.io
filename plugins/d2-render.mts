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

import type { Selector, Rule, MediaList } from "lightningcss";
import type { CustomPlugin, PluginConfig } from "svgo";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { D2 } from "@terrastruct/d2";
import { transform } from "lightningcss";
import { optimize } from "svgo";

const fontsDir = resolve(import.meta.dirname, "fonts");
const fontRegular = await readFile(
  resolve(fontsDir, "IBMPlexSans-Regular.ttf"),
);
const fontBold = await readFile(resolve(fontsDir, "IBMPlexSans-Bold.ttf"));
const fontItalic = await readFile(resolve(fontsDir, "IBMPlexSans-Italic.ttf"));
const fontSemibold = await readFile(
  resolve(fontsDir, "IBMPlexSans-SemiBold.ttf"),
);

const d2 = new D2();

// Allow the process to exit even though the D2 WASM worker is still alive. The
// bindings do not provide a documented way to shut down the worker and also do
// not handle unref on their own, hence this hack.
type D2WithWorkerUnref = D2 & {
  worker: { unref(): void };
  ready: Promise<void>;
};

(d2 as D2WithWorkerUnref).ready.then(() => {
  (d2 as D2WithWorkerUnref).worker.unref();
});

// Work around bug upstream where concurrent requests deadlock.
let queue: Promise<unknown> = Promise.resolve();

const darkThemeId = 200;

const rootNotLight: Selector = [
  { type: "pseudo-class", kind: "root" },
  {
    type: "pseudo-class",
    kind: "not",
    selectors: [
      [
        {
          type: "attribute",
          name: "data-theme",
          operation: { operator: "equal", value: "light" },
        },
      ],
    ],
  },
];

const rootDark: Selector = [
  { type: "pseudo-class", kind: "root" },
  {
    type: "attribute",
    name: "data-theme",
    operation: { operator: "equal", value: "dark" },
  },
];

function prefixSelectors(selectors: Selector[], prefix: Selector): Selector[] {
  return selectors.map((sel) => [
    ...prefix,
    { type: "combinator", value: "descendant" },
    ...sel,
  ]);
}

function isPrefersColorSchemeDark(query: MediaList): boolean {
  return query.mediaQueries.some((mq) => {
    const cond = mq.condition;

    if (!cond || cond.type !== "feature") {
      return false;
    }

    const val = cond.value as { name?: string; value?: { value?: string } };

    return val?.name === "prefers-color-scheme" && val?.value?.value === "dark";
  });
}

function patchDarkModePlugin(minify: boolean): CustomPlugin {
  return {
    name: "patchDarkModeCSS",
    fn: () => ({
      element: {
        enter(node) {
          if (node.name !== "style") {
            return;
          }

          for (const child of node.children) {
            if (child.type !== "cdata" && child.type !== "text") {
              continue;
            }

            const result = transform({
              filename: "d2.css",
              code: Buffer.from(child.value),
              minify,
              visitor: {
                Rule: {
                  "font-face"() {
                    return [];
                  },
                  media(rule) {
                    if (!isPrefersColorSchemeDark(rule.value.query)) {
                      return rule;
                    }

                    const manualDarkRules: Rule[] = rule.value.rules
                      .filter(
                        (r): r is Rule & { type: "style" } =>
                          r.type === "style",
                      )
                      .map((r) => ({
                        type: "style",
                        value: {
                          ...r.value,
                          selectors: prefixSelectors(
                            r.value.selectors,
                            rootDark,
                          ),
                        },
                      }));

                    const guardedMediaRule = {
                      ...rule,
                      value: {
                        ...rule.value,
                        rules: rule.value.rules.map((r) => {
                          if (r.type !== "style") {
                            return r;
                          }

                          return {
                            ...r,
                            value: {
                              ...r.value,
                              selectors: prefixSelectors(
                                r.value.selectors,
                                rootNotLight,
                              ),
                            },
                          };
                        }),
                      },
                    };

                    return [guardedMediaRule, ...manualDarkRules];
                  },
                },
                RuleExit: {
                  style(rule) {
                    if (
                      rule.value.declarations.declarations.length === 0 &&
                      rule.value.declarations.importantDeclarations.length === 0
                    ) {
                      return [];
                    }
                  },
                },
                Declaration: {
                  "font-family"(property) {
                    if (property.property === "unparsed") {
                      return;
                    }

                    const isD2Font = property.value.some(
                      (f: string) =>
                        typeof f === "string" && /^d2-[a-f0-9]+-font-/.test(f),
                    );

                    if (isD2Font) {
                      return [];
                    }
                  },
                },
              },
            });

            child.value = result.code.toString();
          }
        },
      },
    }),
  };
}

const d2FontRegex = /d2-[a-f0-9]+-font-(regular|bold|italic|semibold)/;
const d2BaseFontSize = 16;

const stripD2FontsPlugin: CustomPlugin = {
  name: "stripD2Fonts",
  fn: () => ({
    element: {
      enter(node) {
        const style = node.attributes["style"];

        if (!style) {
          return;
        }

        let cleaned = style;

        cleaned = cleaned.replace(
          /font-size:\s*(\d+(?:\.\d+)?)px/g,
          (_, px) => {
            const em = parseFloat(px) / d2BaseFontSize;
            return `font-size:${em === 1 ? "1" : em}em`;
          },
        );

        const match = d2FontRegex.exec(cleaned);

        if (match) {
          cleaned = cleaned
            .replace(/font-family:\s*[^;]+;?\s*/g, "")
            .trim()
            .replace(/;\s*$/, "")
            .replace(/^;\s*/, "")
            .trim();
        }

        if (cleaned !== style) {
          if (cleaned) {
            node.attributes["style"] = cleaned;
          } else {
            delete node.attributes["style"];
          }
        }
      },
    },
  }),
};

function patchDarkModeCSS(svg: string, optimizeSvg: boolean): string {
  const plugins: PluginConfig[] = optimizeSvg
    ? [
        {
          name: "preset-default",
          params: { overrides: { inlineStyles: false } },
        },
        stripD2FontsPlugin,
        patchDarkModePlugin(true),
      ]
    : [stripD2FontsPlugin, patchDarkModePlugin(false)];

  return optimize(svg, { plugins }).data;
}

export interface RenderD2Options {
  optimize?: boolean;
}

export function renderD2(
  source: string,
  { optimize: optimizeSvg = false }: RenderD2Options = {},
): Promise<string> {
  const task = queue.then(async () => {
    const compiled = await d2.compile(source, {
      options: {
        fontRegular,
        fontBold,
        fontItalic,
        fontSemibold,
      },
    });

    const svg = await d2.render(compiled.diagram, {
      ...compiled.renderOptions,
      noXMLTag: true,
      darkThemeID: darkThemeId,
    });

    return patchDarkModeCSS(svg, optimizeSvg);
  });

  queue = task.catch(() => {});

  return task;
}
