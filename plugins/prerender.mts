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

import type { Logger, Plugin } from "vite";
import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve, dirname } from "path";
import { createServer } from "vite";
import { minify } from "html-minifier-terser";
import { getAllPages, pathToOutFile, siteUrl } from "./routes.mts";

export default function prerenderPlugin(): Plugin {
  let root: string;
  let outDir: string;
  let logger: Logger;

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
      const pages = await getAllPages();

      const vite = await createServer({
        root,
        server: { middlewareMode: true },
        appType: "custom",
        logLevel: "warn",
      });

      try {
        const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

        for (const page of pages) {
          const canonical = `${siteUrl}${page.path}`;
          const {
            html: appHtml,
            hydrationScript,
            shikiCSS,
          } = await render(page.path);

          let html = template;

          html = html.replace("</head>", `${hydrationScript}</head>`);

          if (shikiCSS) {
            html = html.replace("</head>", `<style>${shikiCSS}</style></head>`);
          }

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
            `<link rel="canonical" href="${canonical}" />`,
          );
          html = html.replace(
            /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:url" content="${canonical}" />`,
          );
          html = html.replace(
            /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:title" content="${page.title}" />`,
          );
          html = html.replace(
            /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
            `<meta property="og:description" content="${page.description}" />`,
          );

          if (
            "article" in page &&
            page.path.startsWith("/blogg/") &&
            !page.path.endsWith("/blogg/")
          ) {
            const { article } = page;

            html = html.replace(
              /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
              `<meta property="og:type" content="article" />`,
            );

            html = html.replace(
              "</head>",
              `<meta property="article:published_time" content="${article.date}" />\n</head>`,
            );

            if (article.updated) {
              html = html.replace(
                "</head>",
                `<meta property="article:modified_time" content="${article.updated}" />\n</head>`,
              );
            }

            if (article.author) {
              html = html.replace(
                "</head>",
                `<meta property="article:author" content="${article.author}" />\n</head>`,
              );
            }

            if (article.image) {
              html = html.replace(
                /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
                `<meta property="og:image" content="${article.image}" />`,
              );
            }

            html = html.replace(
              "</head>",
              `<link rel="license" href="https://creativecommons.org/licenses/by-sa/4.0/deed.no" />\n</head>`,
            );
          }

          const outPath = resolve(outDir, pathToOutFile(page.path));

          const minified = await minify(html, {
            collapseWhitespace: true,
            conservativeCollapse: true,
            removeComments: true,
            ignoreCustomComments: [/SPDX-/, /^[#/$!]{1,2}$/],
            minifyCSS: true,
            minifyJS: true,
          });

          await mkdir(dirname(outPath), { recursive: true });
          await writeFile(outPath, minified);
          logger.info(`  ✓ ${page.path}`);
        }
      } finally {
        await vite.close();
      }

      logger.info("Prerender complete.");
    },
  };
}
