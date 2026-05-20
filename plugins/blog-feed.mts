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
import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { resolve } from "path";
import { Feed } from "feed";
import { parseFrontmatter, postsDir } from "./lib.mts";

const authorsFile = resolve(import.meta.dirname, "../content/data/authors.yml");

const siteUrl = "https://ordbokapi.org";

async function generateFeed(): Promise<string> {
  let files;

  try {
    files = await readdir(postsDir);
  } catch {
    return "";
  }

  const mdFiles = files
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  let authors = {};

  try {
    const raw = await readFile(authorsFile, "utf-8");
    const { load } = await import("js-yaml");

    authors = load(raw) ?? {};
  } catch {}

  const feed = new Feed({
    title: "Ordbok API Utviklingsblogg",
    description: "Nyheiter og oppdateringar om utviklinga av Ordbok API.",
    id: `${siteUrl}/blogg/`,
    link: `${siteUrl}/blogg/`,
    language: "nn",
    generator: "https://github.com/ordbokapi/ordbokapi.github.io",
    feedLinks: {
      rss: `${siteUrl}/blogg/feed.xml`,
    },
  });

  for (const file of mdFiles) {
    const raw = await readFile(resolve(postsDir, file), "utf-8");
    const { data } = parseFrontmatter(raw);

    if (data.draft) {
      continue;
    }

    const fileDate = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);

    if (!fileDate) {
      continue;
    }

    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const datePath = `${fileDate[1]}/${fileDate[2]}/${fileDate[3]}`;
    const postPath = `/blogg/${datePath}/${slug}/`;
    const date = data.date ? new Date(data.date) : new Date(file.slice(0, 10));
    const authorName = data.author
      ? ((authors as Record<string, { name?: string }>)[data.author]?.name ??
        undefined)
      : undefined;

    feed.addItem({
      title: data.title ?? slug,
      id: `${siteUrl}${postPath}`,
      link: `${siteUrl}${postPath}`,
      description: data.summary ?? "",
      date,
      ...(authorName && { author: [{ name: authorName }] }),
    });
  }

  return feed.rss2();
}

export default function blogFeedPlugin(): Plugin {
  let outDir: string;

  return {
    name: "blog-feed",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== "/blogg/feed.xml") {
          return next();
        }

        const xml = await generateFeed();

        res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        res.end(xml);
      });
    },

    async closeBundle() {
      const feed = await generateFeed();

      if (!feed) {
        return;
      }

      await mkdir(resolve(outDir, "blogg"), { recursive: true });
      await writeFile(resolve(outDir, "blogg/feed.xml"), feed);
    },
  };
}
