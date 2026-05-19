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
import showcaseDataPlugin from "./plugins/showcase-data.mjs";
import prerenderPlugin from "./plugins/prerender.mjs";
import notFoundPlugin from "./plugins/not-found.mjs";
import scandiaFontPlugin from "./plugins/scandia-font.mjs";

export default defineConfig({
  appType: "mpa",
  plugins: [
    showcaseDataPlugin(),
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
  },
});
