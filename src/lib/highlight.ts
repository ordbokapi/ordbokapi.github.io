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

export type Language = "graphql" | "json" | "javascript";

let highlighterPromise:
  | Promise<import("shiki/core").HighlighterCore>
  | undefined;

function getHighlighter() {
  if (highlighterPromise) {
    return highlighterPromise;
  }

  highlighterPromise = (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] =
      await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);
    const [graphql, json, javascript, githubLight, githubDark] =
      await Promise.all([
        import("shiki/langs/graphql.mjs"),
        import("shiki/langs/json.mjs"),
        import("shiki/langs/javascript.mjs"),
        import("shiki/themes/github-light.mjs"),
        import("shiki/themes/github-dark.mjs"),
      ]);

    return createHighlighterCore({
      themes: [githubLight.default, githubDark.default],
      langs: [graphql.default, json.default, javascript.default],
      engine: createJavaScriptRegexEngine(),
    });
  })();
  return highlighterPromise;
}

export async function highlight(code: string, lang: Language): Promise<string> {
  if (!import.meta.env.SSR && !import.meta.env.DEV) {
    return "";
  }

  return (await getHighlighter()).codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
