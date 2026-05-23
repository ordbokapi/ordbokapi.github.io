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

import { Show, For } from "solid-js";
import type { BlogPost, Author } from "virtual:blog-content";
import styles from "./post-card.module.css";

interface Props {
  post: BlogPost;
  author: Author | null;
}

export default function PostCard(props: Props) {
  return (
    <a href={props.post.path} class={styles.card}>
      <Show when={props.post.draft}>
        <span class={styles.draftBadge}>Utkast</span>
      </Show>
      <Show when={props.post.image}>
        <img
          src={props.post.image!}
          alt=""
          class={styles.image}
          loading="lazy"
        />
      </Show>
      <div class={styles.body}>
        <div class={styles.titleRow}>
          <h2 class={styles.title}>{props.post.title}</h2>
          <Show when={props.post.categories.length > 0}>
            <div class={styles.categories}>
              <For each={props.post.categories}>
                {(cat) => <span class={styles.categoryBadge}>{cat.name}</span>}
              </For>
            </div>
          </Show>
        </div>
        <div class={styles.meta}>
          <Show when={props.author?.picture}>
            <img
              src={props.author!.picture}
              alt=""
              class={styles.avatar}
              width="24"
              height="24"
            />
          </Show>
          <div class={styles.metaText}>
            <Show when={props.author}>
              <span>
                {props.author!.name}
                <Show when={props.author!.pronouns}>
                  {" "}
                  <span class={styles.pronouns}>
                    ({props.author!.pronouns})
                  </span>
                </Show>
              </span>
              <span class={styles.separator} aria-hidden="true">
                |
              </span>
            </Show>
            <time dateTime={props.post.date}>{props.post.dateFormatted}</time>
          </div>
        </div>
        <Show when={props.post.summary}>
          <p class={styles.summary}>{props.post.summary}</p>
        </Show>
      </div>
    </a>
  );
}
