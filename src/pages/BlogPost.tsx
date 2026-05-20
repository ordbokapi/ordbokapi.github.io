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
import { NoHydration } from "solid-js/web";
import type { BlogPost, Author } from "virtual:blog-content";
import styles from "./blog-post.module.css";

interface Props {
  post: BlogPost;
  author?: Author;
}

export default function BlogPostPage(props: Props) {
  return (
    <NoHydration>
      <article class={styles.page}>
        <header class={styles.header}>
          <Show when={props.post.draft}>
            <span class={styles.draftBadge}>Utkast</span>
          </Show>
          <h1>{props.post.title}</h1>
          <div class={styles.meta}>
            <Show when={props.author?.picture}>
              <img
                src={props.author!.picture}
                alt=""
                class={styles.avatar}
                width="40"
                height="40"
              />
            </Show>
            <Show when={props.author}>
              <span>
                <span class={styles.authorName}>{props.author!.name}</span>
                <Show when={props.author!.pronouns}>
                  {" "}
                  <span class={styles.pronouns}>
                    ({props.author!.pronouns})
                  </span>
                </Show>
              </span>
              <span class={styles.separator}>|</span>
            </Show>
            <time dateTime={props.post.date}>{props.post.dateFormatted}</time>
          </div>
        </header>
        <Show when={props.post.image}>
          {(url) => (
            <img
              src={url()}
              alt=""
              class={styles.featuredImage}
              loading="eager"
              width={props.post.imageWidth ?? undefined}
              height={props.post.imageHeight ?? undefined}
            />
          )}
        </Show>
        <div class={styles.content} innerHTML={props.post.html} />
        <Show when={props.author}>
          <aside class={styles.authorBlurb}>
            <Show when={props.author!.picture}>
              <img
                src={props.author!.picture}
                alt=""
                class={styles.blurbAvatar}
                width="56"
                height="56"
              />
            </Show>
            <div class={styles.blurbContent}>
              <p class={styles.blurbName}>
                {props.author!.name}
                <Show when={props.author!.pronouns}>
                  {" "}
                  <span class={styles.blurbPronouns}>
                    ({props.author!.pronouns})
                  </span>
                </Show>
              </p>
              <Show when={props.author!.bio}>
                <p class={styles.blurbBio}>{props.author!.bio}</p>
              </Show>
              <Show when={props.author!.social?.length}>
                <ul class={styles.blurbSocial}>
                  <For each={props.author!.social}>
                    {(link) => (
                      <li>
                        <a href={link.url}>{link.title}</a>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </div>
          </aside>
        </Show>
        <footer class={styles.licence}>
          <p>
            Innhaldet i denne artikkelen er lisensiert under{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.no"
              rel="license"
            >
              CC BY-SA 4.0
            </a>
            .
          </p>
        </footer>
      </article>
    </NoHydration>
  );
}
