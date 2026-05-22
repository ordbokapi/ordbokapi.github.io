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

import { For } from "solid-js";
import { NoHydration } from "solid-js/web";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import type { BlogPost, Author } from "virtual:blog-content";
import PostCard from "~/components/PostCard";
import styles from "./blog-category.module.css";

interface Props {
  category: string;
  posts: BlogPost[];
  authors: Record<string, Author>;
}

export default function BlogCategory(props: Props) {
  return (
    <NoHydration>
      <div class={styles.page}>
        <header class={styles.header}>
          <a href="/blogg/" class={styles.backLink}>
            <ArrowLeft size={14} aria-hidden="true" /> Utviklingsblogg
          </a>
          <hr />
          <h1>{props.category}</h1>
        </header>
        <div class={styles.postList}>
          <For each={props.posts}>
            {(post) => (
              <PostCard
                post={post}
                author={
                  post.author ? (props.authors[post.author] ?? null) : null
                }
              />
            )}
          </For>
        </div>
        <footer class={styles.licence}>
          <p>
            Blogginnhald er lisensiert under{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.no"
              rel="license"
            >
              CC BY-SA 4.0
            </a>
            .
          </p>
        </footer>
      </div>
    </NoHydration>
  );
}
