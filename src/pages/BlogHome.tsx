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

import { For, Show } from "solid-js";
import { NoHydration } from "solid-js/web";
import MailPlus from "lucide-solid/icons/mail-plus";
import Rss from "lucide-solid/icons/rss";
import type { BlogPost, Author } from "virtual:blog-content";
import styles from "./blog-home.module.css";

interface Props {
  posts: BlogPost[];
  authors: Record<string, Author>;
}

export default function BlogHome(props: Props) {
  return (
    <NoHydration>
      <div class={styles.page}>
        <header class={styles.intro}>
          <div class={styles.introText}>
            <h1>Utviklingsblogg</h1>
            <p class={styles.subtitle}>
              Nyheiter og oppdateringar om utviklinga av Ordbok API.
            </p>
          </div>
          <div class={styles.actions}>
            <a
              href="/blogg/abonner/"
              class={styles.actionLink}
              aria-label="Abonner på e-post"
              title="Abonner på e-post"
            >
              <MailPlus size={22} aria-hidden="true" />
            </a>
            <a
              href="/blogg/feed.xml"
              class={styles.actionLink}
              aria-label="RSS-straum"
              title="RSS-straum"
            >
              <Rss size={22} aria-hidden="true" />
            </a>
          </div>
        </header>
        <div class={styles.postList}>
          <For each={props.posts}>
            {(post) => {
              const author = post.author ? props.authors[post.author] : null;
              return (
                <a href={post.path} class={styles.postCard}>
                  <Show when={post.draft}>
                    <span class={styles.draftBadge}>Utkast</span>
                  </Show>
                  <Show when={post.image}>
                    <img
                      src={post.image!}
                      alt=""
                      class={styles.postCardImage}
                      loading="lazy"
                    />
                  </Show>
                  <div class={styles.postCardBody}>
                    <h2 class={styles.postCardTitle}>{post.title}</h2>
                    <div class={styles.postCardMeta}>
                      <Show when={author}>
                        <Show when={author!.picture}>
                          <img
                            src={author!.picture}
                            alt=""
                            class={styles.postCardAvatar}
                            width="24"
                            height="24"
                          />
                        </Show>
                      </Show>
                      <div class={styles.postCardMetaText}>
                        <Show when={author}>
                          <span>
                            {author!.name}
                            <Show when={author!.pronouns}>
                              {" "}
                              <span class={styles.postCardPronouns}>
                                ({author!.pronouns})
                              </span>
                            </Show>
                          </span>
                          <span class={styles.postCardSeparator}>|</span>
                        </Show>
                        <time dateTime={post.date}>{post.dateFormatted}</time>
                      </div>
                    </div>
                    <Show when={post.summary}>
                      <p class={styles.postCardSummary}>{post.summary}</p>
                    </Show>
                  </div>
                </a>
              );
            }}
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
