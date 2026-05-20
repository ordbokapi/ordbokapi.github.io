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

import { createSignal, onMount, Show } from "solid-js";
import Nav from "~/components/Nav";
import Footer from "~/components/Footer";
import Home from "~/pages/Home";
import Personvern from "~/pages/Personvern";
import NotFound from "~/pages/NotFound";
import BlogHome from "~/pages/BlogHome";
import BlogPostPage from "~/pages/BlogPost";
import BlogSubscribe from "~/pages/BlogSubscribe";
import BlogVerify from "~/pages/BlogVerify";
import BlogUnsubscribe from "~/pages/BlogUnsubscribe";
import { posts, authors } from "virtual:blog-content";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/400-italic.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./App.css";

type Page =
  | "home"
  | "personvern"
  | "not-found"
  | "blog-home"
  | "blog-post"
  | "blog-subscribe"
  | "blog-verify"
  | "blog-unsubscribe";

function getPath(): string {
  if (typeof window !== "undefined") {
    return window.location.pathname.replace(/\/+$/, "") || "/";
  }
  return ((globalThis as any).__SSR_PATH__ ?? "/").replace(/\/+$/, "") || "/";
}

function match<T, R>(
  value: T,
  cases: [((v: T) => boolean) | T, R][],
  defaultCase: R,
): R {
  for (const [predicate, result] of cases) {
    if (typeof predicate === "function") {
      if ((predicate as (v: T) => boolean)(value)) {
        return result;
      }
    } else {
      if (predicate === value) {
        return result;
      }
    }
  }

  return defaultCase;
}

function getPage(path: string): Page {
  return match(
    path,
    [
      ["/", "home"],
      ["/personvern", "personvern"],
      ["/blogg", "blog-home"],
      ["/blogg/abonner", "blog-subscribe"],
      ["/blogg/stadfest", "blog-verify"],
      ["/blogg/avslutt", "blog-unsubscribe"],
      [(p) => p.startsWith("/blogg/"), "blog-post"],
    ],
    "not-found",
  );
}

export default function App() {
  const [path, setPath] = createSignal(getPath());
  const page = () => getPage(path());
  const post = () =>
    posts.find((p) => p.path.replace(/\/+$/, "") === path()) ?? null;
  const postAuthor = () => {
    const p = post();

    return p?.author ? (authors[p.author] ?? null) : null;
  };

  onMount(() => {
    const handler = () => setPath(getPath());

    window.addEventListener("popstate", handler);
  });

  return (
    <>
      <a class="skip-link" href="#main-content">
        Hopp til hovudinnhald
      </a>
      <Nav />
      <main id="main-content">
        <Show when={page() === "home"}>
          <Home />
        </Show>
        <Show when={page() === "personvern"}>
          <Personvern />
        </Show>
        <Show when={page() === "blog-home"}>
          <BlogHome posts={posts} authors={authors} />
        </Show>
        <Show when={page() === "blog-post" && post()}>
          <BlogPostPage post={post()!} author={postAuthor() ?? undefined} />
        </Show>
        <Show when={page() === "blog-subscribe"}>
          <BlogSubscribe />
        </Show>
        <Show when={page() === "blog-verify"}>
          <BlogVerify />
        </Show>
        <Show when={page() === "blog-unsubscribe"}>
          <BlogUnsubscribe />
        </Show>
        <Show
          when={page() === "not-found" || (page() === "blog-post" && !post())}
        >
          <NotFound />
        </Show>
      </main>
      <Footer />
    </>
  );
}
