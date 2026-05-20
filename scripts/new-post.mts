#!/usr/bin/env node
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

import { writeFile, mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import { load } from "js-yaml";
import {
  toSlug,
  postsDir,
  authorsFile,
  draftAssetsDir,
  openInEditor,
} from "./lib.mts";

const title = process.argv[2];

if (!title) {
  console.error('Bruk: yarn new-post "Tittel på innlegget"');
  process.exit(1);
}

const slug = toSlug(title);
const filename = `${slug}.md`;
const assetsDir = draftAssetsDir(slug);

const authorId = process.env.BLOG_AUTHOR ?? "asimonian";
const authors =
  (load(await readFile(authorsFile, "utf-8")) as Record<
    string,
    { name?: string }
  >) ?? {};
const authorName = authors[authorId]?.name ?? authorId;

const year = new Date().getFullYear();
const copyright = `Copyright (C) ${year} ${authorName}`;

const frontmatter = `<!--
SPDX-FileCopyrightText: ${copyright}
SPDX-License-Identifier: CC-BY-SA-4.0
-->

---

title: "${title}"
author: ${authorId}
categories:
summary: ""
draft: true

---
`;

await mkdir(postsDir, { recursive: true });
await mkdir(assetsDir, { recursive: true });
await writeFile(resolve(postsDir, filename), frontmatter);

console.log(`Oppretta: content/posts/${filename}`);
console.log(`Bilete:   public/blogg/drafts/${slug}/`);

openInEditor(resolve(postsDir, filename));
