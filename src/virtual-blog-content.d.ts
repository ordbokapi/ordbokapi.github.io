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

declare module "virtual:blog-content" {
  export interface Category {
    name: string;
    slug: string;
  }

  export interface BlogPost {
    slug: string;
    path: string;
    draft: boolean;
    title: string;
    date: string;
    dateFormatted: string;
    updated: string | null;
    updatedFormatted: string | null;
    author: string | null;
    categories: Category[];
    summary: string;
    image: string | null;
    imageAlt: string | null;
    imageWidth: number | null;
    imageHeight: number | null;
    html: string;
  }

  export interface AuthorSocial {
    title: string;
    url: string;
  }

  export interface Author {
    name: string;
    pronouns?: string;
    bio?: string;
    picture?: string;
    social?: AuthorSocial[];
  }

  export const posts: BlogPost[];
  export const authors: Record<string, Author>;
  export const categories: Category[];
}
