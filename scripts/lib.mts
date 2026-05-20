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

import { resolve } from "path";
import { execFile } from "child_process";

const root = resolve(import.meta.dirname, "..");

export const postsDir = resolve(root, "content/posts");
export const publicBlogDir = resolve(root, "public/blogg");
export const authorsFile = resolve(root, "content/data/authors.yml");

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function draftAssetsDir(slug: string): string {
  return resolve(publicBlogDir, "drafts", slug);
}

export function openInEditor(filePath: string): void {
  if (process.env.TERM_PROGRAM === "vscode") {
    execFile("code", [filePath]);
  }
}
