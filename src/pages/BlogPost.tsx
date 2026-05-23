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

import { Show, For, onMount } from "solid-js";
import { NoHydration } from "solid-js/web";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import type { BlogPost, Author } from "virtual:blog-content";
import { categoryPath } from "../categories";
import { setupLightbox } from "../lightbox";
import { setupCodeCopy } from "../code-copy";
import { setupSandboxTabs } from "../sandbox-query";
import "katex/dist/katex.min.css";
import "virtual:blog-icons.css";
import styles from "./blog-post.module.css";

interface Props {
  post: BlogPost;
  author?: Author;
}

export default function BlogPostPage(props: Props) {
  let articleRef!: HTMLElement;

  onMount(() => {
    setupLightbox(articleRef);
    setupCodeCopy(articleRef);
    setupSandboxTabs(articleRef);
  });

  return (
    <article ref={articleRef} class={styles.page}>
      <NoHydration>
        <header class={styles.header}>
          <a href="/blogg/" class={styles.backLink}>
            <ArrowLeft size={14} aria-hidden="true" /> Utviklingsblogg
          </a>
          <hr />
          <Show when={props.post.draft}>
            <span class={styles.draftBadge}>Utkast</span>
          </Show>
          <Show when={props.post.categories.length > 0}>
            <div class={styles.categories} role="list" aria-label="Kategoriar">
              <For each={props.post.categories}>
                {(cat) => (
                  <a
                    href={categoryPath(cat.slug)}
                    class={styles.categoryBadge}
                    role="listitem"
                  >
                    {cat.name}
                  </a>
                )}
              </For>
            </div>
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
            <div class={styles.metaText}>
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
              <Show when={props.post.updatedFormatted}>
                <span class={styles.separator}>|</span>
                <span class={styles.updated}>
                  Oppdatert{" "}
                  <time dateTime={props.post.updated!}>
                    {props.post.updatedFormatted}
                  </time>
                </span>
              </Show>
            </div>
          </div>
        </header>
        <Show when={props.post.image}>
          {(url) => (
            <img
              src={url()}
              alt={props.post.imageAlt ?? ""}
              class={`${styles.featuredImage} zoomable`}
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
      </NoHydration>
    </article>
  );
}
