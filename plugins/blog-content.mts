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
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { renderD2 } from "./d2-render.mts";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import imageSize from "image-size";
import { load as loadYaml } from "js-yaml";
import { parseFrontmatter, postsDir, publicDir } from "./lib.mts";
import rehypeAlerts from "./rehype-alerts.mts";
import rehypeFigure from "./rehype-figure.mts";

function remarkPreserveMeta() {
  return (tree: Parameters<ReturnType<typeof rehypeRaw>>[0]) => {
    visit(
      tree,
      "code",
      (node: { meta?: string; data?: Record<string, unknown> }) => {
        if (node.meta) {
          node.data ??= {};
          node.data.hProperties ??= {};
          (node.data.hProperties as Record<string, unknown>).dataMeta =
            node.meta;
        }
      },
    );
  };
}

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
        const n = node as unknown as (typeof imgNodes)[number];
        const existing = n.properties.className;

        n.properties.className = existing ? `${existing} zoomable` : "zoomable";
        imgNodes.push(n);
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

function rehypeD2({ optimize = false } = {}) {
  return async (tree: Parameters<ReturnType<typeof rehypeRaw>>[0]) => {
    const codeBlocks: Array<{
      node: {
        type: string;
        tagName: string;
        properties: Record<string, unknown>;
        children: Array<{
          type: string;
          value?: string;
          tagName?: string;
          properties?: Record<string, unknown>;
          children?: Array<{ value?: string }>;
        }>;
      };
      parent: { children: Array<unknown> };
      index: number;
    }> = [];

    visit(tree, "element", (node, index, parent) => {
      if (
        node.tagName === "pre" &&
        node.children?.length === 1 &&
        (node.children[0] as { tagName?: string }).tagName === "code"
      ) {
        const code = node.children[0] as {
          properties?: { className?: string[] };
          children?: Array<{ value?: string }>;
        };
        const classes = code.properties?.className ?? [];
        if (classes.includes("language-d2")) {
          codeBlocks.push({
            node: node as unknown as (typeof codeBlocks)[number]["node"],
            parent: parent as unknown as (typeof codeBlocks)[number]["parent"],
            index: index!,
          });
        }
      }
    });

    await Promise.all(
      codeBlocks.map(async ({ node, parent, index }) => {
        const code = node.children[0];
        const source = code.children?.map((c) => c.value ?? "").join("") ?? "";
        const meta = (code.properties?.dataMeta as string) ?? "";
        const titleMatch = meta.match(/title=(?:"([^"]+)"|(\S+))/);
        const title = titleMatch?.[1] ?? titleMatch?.[2];

        try {
          const svg = await renderD2(source, { optimize });
          const diagram = `<div class="d2-diagram zoomable" tabindex="0" role="button" aria-label="${title ? title.replace(/"/g, "&quot;") + ": t" : "Diagram: t"}rykk for å opne i fullskjerm">${svg}</div>`;

          if (title) {
            parent.children[index] = {
              type: "raw",
              value: `<figure>${diagram}<figcaption>${title}</figcaption></figure>`,
            };
          } else {
            parent.children[index] = {
              type: "raw",
              value: diagram,
            };
          }
        } catch {}
      }),
    );
  };
}

async function processMarkdown(
  content: string,
  { isBuild = false } = {},
): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkPreserveMeta)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeAlerts)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "Lenkje til seksjon",
      },
    })
    .use(rehypeFigure)
    .use(rehypeD2, { optimize: isBuild })
    .use(rehypeImageSize)
    .use(rehypeShiki, {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers: [
        {
          pre(node) {
            delete node.properties.tabindex;
          },
        },
      ],
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return String(result);
}

async function loadPosts(includeDrafts: boolean, isBuild: boolean) {
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
    const html = await processMarkdown(content, { isBuild });

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
        loadPosts(!isBuild, isBuild),
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
