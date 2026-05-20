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

import type { Plugin } from "vite";
import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import XmlBuilder from "fast-xml-builder";
import { getAllPages, siteUrl } from "./routes.mts";

const builder = new XmlBuilder({
  ignoreAttributes: false,
  format: true,
  suppressEmptyNode: true,
});

async function generateSitemap(): Promise<string> {
  const pages = await getAllPages();

  const urlset = {
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    urlset: {
      "@_xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      url: pages
        .filter((p) => p.sitemap)
        .map((p) => ({
          loc: `${siteUrl}${p.path}`,
          changefreq: p.sitemap!.changefreq,
          priority: p.sitemap!.priority,
        })),
    },
  };

  return builder.build(urlset);
}

export default function sitemapPlugin(): Plugin {
  let outDir: string;

  return {
    name: "sitemap",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/sitemap.xml") {
          return next();
        }

        const xml = await generateSitemap();

        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        res.end(xml);
      });
    },

    async closeBundle() {
      const xml = await generateSitemap();

      await mkdir(outDir, { recursive: true });
      await writeFile(resolve(outDir, "sitemap.xml"), xml);
    },
  };
}
