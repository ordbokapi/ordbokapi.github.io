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

import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { createServer } from "vite";

const pages = [
  {
    path: "/",
    outFile: "index.html",
    title: "Ordbok API | Tre norske ordbøker. Eitt API.",
    description:
      "Gratis og ope GraphQL API for Bokmålsordboka, Nynorskordboka og Norsk Ordbok. Utforsk, bygg med og forsk på det norske språket.",
    canonical: "https://ordbokapi.org/",
  },
  {
    path: "/personvern/",
    outFile: "personvern/index.html",
    title: "Personvern | Ordbok API",
    description:
      "Personvernpolicy for Ordbok API. Korleis vi handsamar data og personvern.",
    canonical: "https://ordbokapi.org/personvern/",
  },
  {
    path: "/404",
    outFile: "404.html",
    title: "Sida finst ikkje | Ordbok API",
    description: "Sida du leita etter, finst ikkje.",
    canonical: "https://ordbokapi.org/",
  },
];

export default function prerenderPlugin() {
  let root;
  let outDir;
  let logger;

  return {
    name: "prerender",
    apply: "build",

    configResolved(config) {
      root = config.root;
      outDir = resolve(root, config.build.outDir);
      logger = config.logger;
    },

    async closeBundle() {
      logger.info("\nPrerendering pages...");

      const template = await readFile(resolve(outDir, "index.html"), "utf-8");

      const vite = await createServer({
        root,
        server: { middlewareMode: true },
        appType: "custom",
        logLevel: "warn",
      });

      try {
        const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

        for (const page of pages) {
          const { html: appHtml, hydrationScript } = await render(page.path);

          let html = template;

          html = html.replace("</head>", `${hydrationScript}</head>`);
          html = html.replace("<!--app-->", appHtml);
          html = html.replace(
            /<title>[^<]*<\/title>/,
            `<title>${page.title}</title>`,
          );
          html = html.replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${page.description}" />`,
          );
          html = html.replace(
            /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
            `<link rel="canonical" href="${page.canonical}" />`,
          );
          html = html.replace(
            /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:url" content="${page.canonical}" />`,
          );
          html = html.replace(
            /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:title" content="${page.title}" />`,
          );
          html = html.replace(
            /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:description" content="${page.description}" />`,
          );

          const outPath = resolve(outDir, page.outFile);

          await mkdir(dirname(outPath), { recursive: true });
          await writeFile(outPath, html);
          logger.info(`  ✓ ${page.path}`);
        }
      } finally {
        await vite.close();
      }

      logger.info("Prerender complete.");
    },
  };
}
