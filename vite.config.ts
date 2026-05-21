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

import { resolve } from "node:path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import showcaseDataPlugin from "./plugins/showcase-data.mts";
import blogContentPlugin from "./plugins/blog-content.mts";
import blogFeedPlugin from "./plugins/blog-feed.mts";
import sitemapPlugin from "./plugins/sitemap.mts";
import prerenderPlugin from "./plugins/prerender.mts";
import notFoundPlugin from "./plugins/not-found.mts";
import scandiaFontPlugin from "./plugins/scandia-font.mts";

export default defineConfig({
  appType: "mpa",
  plugins: [
    showcaseDataPlugin(),
    blogContentPlugin(),
    blogFeedPlugin(),
    sitemapPlugin(),
    solidPlugin({ ssr: true }),
    prerenderPlugin(),
    notFoundPlugin(),
    scandiaFontPlugin(),
  ],
  resolve: {
    alias: {
      "~": resolve(import.meta.dirname, "src"),
    },
  },
  optimizeDeps: {
    include: ["solid-js", "solid-js/web"],
  },
  build: {
    target: "esnext",
    outDir: "dist",
    watch: process.argv.includes("--watch")
      ? { include: ["src/**", "content/**"] }
      : null,
  },
});
