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

import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import { transformerStyleToClass } from "@shikijs/transformers";

export type Language = BundledLanguage;
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>;

const toClass = transformerStyleToClass();

let highlighterPromise: Promise<Highlighter> | null = null;
let highlighterInstance: Highlighter | null = null;

function getHighlighter() {
  if (highlighterPromise) {
    return highlighterPromise;
  }

  const shiki = import.meta.env.SSR
    ? import("shiki")
    : import("shiki/bundle/web");

  highlighterPromise = shiki.then(async ({ createHighlighter }) => {
    const highlighter = await createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["graphql", "json", "javascript"],
    });
    highlighterInstance = highlighter as Highlighter;
    return highlighter;
  }) as Promise<Highlighter>;

  return highlighterPromise;
}

export async function initHighlighter(): Promise<void> {
  await getHighlighter();
}

export function getHighlightCSS(): string {
  return toClass.getCSS();
}

export function highlightSync(code: string, lang: Language): string {
  if (!highlighterInstance) {
    return "";
  }

  return highlighterInstance.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      toClass,
      {
        pre(node) {
          delete node.properties.tabindex;
        },
      },
    ],
  });
}

export async function highlight(code: string, lang: Language): Promise<string> {
  if (!import.meta.env.SSR && !import.meta.env.DEV) {
    return "";
  }

  const highlighter = await getHighlighter();
  await highlighter.loadLanguage(lang);

  const html = highlighter.codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    transformers: [
      toClass,
      {
        pre(node) {
          delete node.properties.tabindex;
        },
      },
    ],
  });

  if (import.meta.env.DEV && !import.meta.env.SSR) {
    let styleElem = document.getElementById("shiki-dev-css");

    if (!styleElem) {
      styleElem = document.createElement("style");
      styleElem.id = "shiki-dev-css";
      document.head.appendChild(styleElem);
    }

    styleElem.textContent = toClass.getCSS();
  }

  return html;
}
