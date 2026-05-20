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

import { readFile, readdir } from "fs/promises";
import { resolve } from "path";
import { load as loadYaml } from "js-yaml";
import { parseFrontmatter, postsDir } from "./lib.mts";

const authorsFile = resolve(import.meta.dirname, "../content/data/authors.yml");

export const siteUrl = "https://ordbokapi.org";

export const staticPages = [
  {
    path: "/",
    title: "Ordbok API | Tre norske ordbøker. Eitt API.",
    description:
      "Gratis og ope GraphQL API for Bokmålsordboka, Nynorskordboka og Norsk Ordbok. Utforsk, bygg med og forsk på det norske språket.",
    sitemap: { changefreq: "weekly", priority: 1.0 },
  },
  {
    path: "/personvern/",
    title: "Personvern | Ordbok API",
    description:
      "Personvernpolicy for Ordbok API. Korleis vi handsamar data og personvern.",
    sitemap: { changefreq: "monthly", priority: 0.3 },
  },
  {
    path: "/blogg/",
    title: "Utviklingsblogg | Ordbok API",
    description: "Nyheiter og oppdateringar om utviklinga av Ordbok API.",
    sitemap: { changefreq: "weekly", priority: 0.8 },
  },
  {
    path: "/blogg/abonner/",
    title: "Abonner | Ordbok API",
    description: "Abonner på bloggoppdateringar frå Ordbok API.",
    sitemap: { changefreq: "yearly", priority: 0.3 },
  },
  {
    path: "/blogg/stadfest/",
    title: "Stadfest abonnement | Ordbok API",
    description: "Stadfest e-postabonnementet ditt.",
  },
  {
    path: "/blogg/avslutt/",
    title: "Avslutt abonnement | Ordbok API",
    description: "Avslutt e-postabonnementet ditt.",
  },
  {
    path: "/404",
    title: "Sida finst ikkje | Ordbok API",
    description: "Sida du leita etter, finst ikkje.",
  },
];

export async function getBlogPages() {
  let files;

  try {
    files = await readdir(postsDir);
  } catch {
    return [];
  }

  let authors: Record<string, { name?: string }> = {};

  try {
    authors =
      (loadYaml(await readFile(authorsFile, "utf-8")) as typeof authors) ?? {};
  } catch {}

  const pages = [];

  for (const file of files
    .filter((f) => f.endsWith(".md"))
    .sort()
    .reverse()) {
    const raw = await readFile(resolve(postsDir, file), "utf-8");
    const { data } = parseFrontmatter(raw);

    if (data.draft) {
      continue;
    }

    const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const fileDate = file.match(/^(\d{4})-(\d{2})-(\d{2})-/);

    if (!fileDate) {
      continue;
    }

    const datePath = `${fileDate[1]}/${fileDate[2]}/${fileDate[3]}`;
    const path = `/blogg/${datePath}/${slug}/`;
    const date = `${fileDate[1]}-${fileDate[2]}-${fileDate[3]}`;
    const authorName = data.author
      ? (authors[data.author]?.name ?? undefined)
      : undefined;
    const image = data.image
      ? `${siteUrl}/blogg/${datePath}/${slug}/${data.image}`
      : undefined;

    pages.push({
      path,
      title: `${data.title} | Ordbok API`,
      description: data.summary || "",
      sitemap: { changefreq: "yearly" as const, priority: 0.6 },
      article: { date, author: authorName, image },
    });
  }
  return pages;
}

export async function getAllPages() {
  const blogPages = await getBlogPages();

  return [...staticPages, ...blogPages];
}

export function pathToOutFile(path: string): string {
  if (path === "/") {
    return "index.html";
  }

  return !path.endsWith("/")
    ? path.slice(1) + ".html"
    : path.slice(1) + "index.html";
}
