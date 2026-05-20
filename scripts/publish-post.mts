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

import { access, readFile, writeFile, mkdir, cp, rm } from "fs/promises";
import { resolve } from "path";
import { toSlug, postsDir, publicBlogDir, draftAssetsDir } from "./lib.mts";

const input = process.argv[2];

if (!input) {
  console.error('Bruk: yarn publish-post "tittel/slug"');
  process.exit(1);
}

const draftSlug = toSlug(input);

const draftFile = resolve(postsDir, `${draftSlug}.md`);

try {
  await access(draftFile);
} catch {
  console.error(`Fann ikkje utkastet: content/posts/${draftSlug}.md`);
  process.exit(1);
}

const now = Temporal.Now.zonedDateTimeISO();
const today = now.toPlainDate();
const pad = (n: number): string => String(n).padStart(2, "0");
const offset = now.offset;
const offsetCompact = offset.replace(":", "");
const timestamp = `${today} ${pad(now.hour)}:${pad(now.minute)}:${pad(now.second)} ${offsetCompact}`;
const datePath = `${today.year}/${pad(today.month)}/${pad(today.day)}`;

let content = await readFile(draftFile, "utf-8");

const titleMatch = content.match(/^title:\s*"?([^"\n]+)"?\s*$/m);
const publishSlug = titleMatch ? toSlug(titleMatch[1]) : draftSlug;

content = content.replace(/^draft:\s*true\n/m, "");
content = content.replace(/^(title:.*\n)/m, `$1date: ${timestamp}\n`);

const draftsAssetDir = draftAssetsDir(draftSlug);
const publishedAssetDir = resolve(publicBlogDir, datePath, publishSlug);

try {
  await access(draftsAssetDir);
  await mkdir(publishedAssetDir, { recursive: true });
  await cp(draftsAssetDir, publishedAssetDir, { recursive: true });
  await rm(draftsAssetDir, { recursive: true });
} catch {
  // No drafts assets to move.
}

content = content.replaceAll(
  `/blogg/drafts/${draftSlug}/`,
  `/blogg/${datePath}/${publishSlug}/`,
);

const publishedFile = resolve(postsDir, `${today}-${publishSlug}.md`);

await writeFile(publishedFile, content);
await rm(draftFile);

console.log(`Publisert: content/posts/${today}-${publishSlug}.md`);

try {
  await access(publishedAssetDir);
  console.log(`Bilete:    public/blogg/${datePath}/${publishSlug}/`);
} catch {
  // No published assets.
}
