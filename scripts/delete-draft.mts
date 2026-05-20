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

import { rm, stat } from "fs/promises";
import { resolve } from "path";
import { createInterface } from "readline/promises";
import { toSlug, postsDir, draftAssetsDir } from "./lib.mts";

const args = process.argv.slice(2);
const yes = args.includes("-y") || args.includes("--yes");
const titleOrSlug = args.find((a) => !a.startsWith("-"));

if (!titleOrSlug) {
  console.error("Bruk: yarn delete-draft [-y|--yes] <tittel/slug>");
  process.exit(1);
}

const slug = toSlug(titleOrSlug);
const postFile = resolve(postsDir, `${slug}.md`);
const assetsDir = draftAssetsDir(slug);

const postExists = await stat(postFile).then(
  () => true,
  () => false,
);
const assetsExist = await stat(assetsDir).then(
  (s) => s.isDirectory(),
  () => false,
);

if (!postExists && !assetsExist) {
  console.error(`Fann ikkje utkast med slug «${slug}».`);
  process.exit(1);
}

console.log("Vil sletta:");

if (postExists) {
  console.log(`  content/posts/${slug}.md`);
}

if (assetsExist) {
  console.log(`  public/blogg/drafts/${slug}/`);
}

if (!yes) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("\nEr du sikker? (j/N) ");

  rl.close();

  if (answer.toLowerCase() !== "j") {
    console.log("Avbrote.");
    process.exit(0);
  }
}

if (postExists) {
  await rm(postFile);
}

if (assetsExist) {
  await rm(assetsDir, { recursive: true });
}

console.log("Sletta.");
