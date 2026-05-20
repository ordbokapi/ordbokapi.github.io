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
import { readFile, readdir } from "fs/promises";
import { resolve } from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import imageSize from "image-size";
import { load as loadYaml } from "js-yaml";
import { parseFrontmatter, postsDir, publicDir } from "./lib.mts";

const virtualId = "virtual:blog-content";
const resolvedId = "\0" + virtualId;

const authorsFile = resolve(import.meta.dirname, "../content/data/authors.yml");

function parsePlainDate(
  filename: string,
  frontmatterDate: unknown,
): Temporal.PlainDate {
  if (frontmatterDate) {
    if (frontmatterDate instanceof Date) {
      return Temporal.Instant.fromEpochMilliseconds(frontmatterDate.getTime())
        .toZonedDateTimeISO("UTC")
        .toPlainDate();
    }

    const str = String(frontmatterDate)
      .replace(" ", "T")
      .replace(/ ([+-]\d{2})(\d{2})$/, "$1:$2");

    return Temporal.Instant.from(str).toZonedDateTimeISO("UTC").toPlainDate();
  }
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-/);

  if (match) {
    return Temporal.PlainDate.from(match[1]);
  }

  return Temporal.Now.plainDateISO();
}

function extractSlug(filename: string): string {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

function formatDate(date: Temporal.PlainDate): string {
  const months = [
    "januar",
    "februar",
    "mars",
    "april",
    "mai",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "desember",
  ];

  return `${date.day}. ${months[date.month - 1]} ${date.year}`;
}

function rehypeImageSize() {
  return async (tree: Parameters<ReturnType<typeof rehypeRaw>>[0]) => {
    const imgNodes: Array<{
      properties: Record<string, string | undefined>;
    }> = [];

    visit(tree, "element", (node) => {
      if (node.tagName === "img") {
        imgNodes.push(node as unknown as (typeof imgNodes)[number]);
      }
    });

    await Promise.all(
      imgNodes.map(async (node) => {
        const src = node.properties?.src;

        if (!src || !src.startsWith("/")) {
          return;
        }

        if (node.properties.width && node.properties.height) {
          return;
        }

        try {
          const filePath = resolve(publicDir, src.slice(1));
          const buf = await readFile(filePath);
          const { width, height } = imageSize(buf);

          if (width && height) {
            node.properties.width = String(width);
            node.properties.height = String(height);
          }
        } catch {}
      }),
    );
  };
}

async function getFeaturedImageSize(
  filename: string | undefined,
  assetPath: string,
): Promise<{ imageWidth: number | null; imageHeight: number | null }> {
  if (!filename) {
    return { imageWidth: null, imageHeight: null };
  }

  try {
    const filePath = resolve(publicDir, assetPath.slice(1), filename);
    const buf = await readFile(filePath);
    const { width, height } = imageSize(buf);

    return { imageWidth: width ?? null, imageHeight: height ?? null };
  } catch {
    return { imageWidth: null, imageHeight: null };
  }
}

async function processMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeImageSize)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}

async function loadPosts(includeDrafts: boolean) {
  let files;

  try {
    files = await readdir(postsDir);
  } catch {
    return [];
  }

  const mdFiles = files
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse();

  const posts = [];
  for (const file of mdFiles) {
    const raw = await readFile(resolve(postsDir, file), "utf-8");
    const { data: frontmatter, content } = parseFrontmatter(raw);

    const isDraft = Boolean(frontmatter.draft);

    if (isDraft && !includeDrafts) {
      continue;
    }

    const slug = extractSlug(file);
    const date = parsePlainDate(file, frontmatter.date);
    const html = await processMarkdown(content);

    const fileDate = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);
    const datePath = fileDate
      ? `${fileDate[1]}/${fileDate[2]}/${fileDate[3]}`
      : null;
    const path = datePath
      ? `/blogg/${datePath}/${slug}/`
      : `/blogg/drafts/${slug}/`;
    const assetPath = datePath
      ? `/blogg/${datePath}/${slug}`
      : `/blogg/drafts/${slug}`;

    posts.push({
      slug,
      path,
      draft: isDraft,
      title: frontmatter.title ?? slug,
      date: date.toString(),
      dateFormatted: formatDate(date),
      author: frontmatter.author ?? null,
      categories: frontmatter.categories
        ? Array.isArray(frontmatter.categories)
          ? frontmatter.categories
          : frontmatter.categories.split(/\s+/)
        : [],
      summary: frontmatter.summary ?? "",
      image: frontmatter.image ? `${assetPath}/${frontmatter.image}` : null,
      ...(await getFeaturedImageSize(frontmatter.image, assetPath)),
      html,
    });
  }

  return posts;
}

async function loadAuthors() {
  try {
    const raw = await readFile(authorsFile, "utf-8");

    return loadYaml(raw) ?? {};
  } catch {
    return {};
  }
}

export default function blogContentPlugin(): Plugin {
  let isBuild = false;

  return {
    name: "blog-content",

    configResolved(config) {
      isBuild = config.command === "build" || config.appType === "custom";
    },

    resolveId(id) {
      if (id === virtualId) {
        return resolvedId;
      }
    },

    configureServer(server) {
      const contentDir = resolve(import.meta.dirname, "../content");

      server.watcher.add(contentDir);

      const invalidate = (file: string) => {
        if (file.startsWith(contentDir)) {
          const mod = server.moduleGraph.getModuleById(resolvedId);

          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      };

      server.watcher.on("add", invalidate);
      server.watcher.on("unlink", invalidate);
    },

    handleHotUpdate({ file, server }) {
      const contentDir = resolve(import.meta.dirname, "../content");

      if (file.startsWith(contentDir)) {
        const mod = server.moduleGraph.getModuleById(resolvedId);

        if (mod) {
          server.moduleGraph.invalidateModule(mod);

          return [mod];
        }

        return [];
      }
    },

    async load(id, options) {
      if (id !== resolvedId) {
        return;
      }

      const [posts, authors] = await Promise.all([
        loadPosts(!isBuild),
        loadAuthors(),
      ]);
      const stripHtml = isBuild && !options?.ssr;
      const outputPosts = stripHtml
        ? posts.map(({ html, ...rest }) => rest)
        : posts;

      return `export const posts = ${JSON.stringify(outputPosts)};
export const authors = ${JSON.stringify(authors)};
`;
    },
  };
}
