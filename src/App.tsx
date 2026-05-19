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
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/400-italic.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./App.css";

function getPage(): "home" | "personvern" | "not-found" {
  if (typeof window !== "undefined") {
    const path = window.location.pathname.replace(/\/+$/, "") || "/";

    if (path === "/personvern") {
      return "personvern";
    }

    if (path === "/") {
      return "home";
    }

    return "not-found";
  }

  const ssrPath =
    ((globalThis as any).__SSR_PATH__ ?? "/").replace(/\/+$/, "") || "/";

  if (ssrPath === "/personvern") {
    return "personvern";
  }

  if (ssrPath === "/404") {
    return "not-found";
  }

  return "home";
}

export default function App() {
  const [page, setPage] = createSignal(getPage());

  onMount(() => {
    const handler = () => setPage(getPage());
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
        <Show when={page() === "not-found"}>
          <NotFound />
        </Show>
      </main>
      <Footer />
    </>
  );
}
