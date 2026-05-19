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

import { writeFile, mkdir } from "fs/promises";
import { resolve } from "path";

const fontFiles = ["ScandiaWebBold.woff2", "ScandiaWebBold.woff"];

export default function scandiaFontPlugin() {
  let outDir;
  let logger;

  return {
    name: "scandia-font",
    apply: "build",

    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      logger = config.logger;
    },

    async closeBundle() {
      const baseUrl = process.env.SCANDIA_FONT_BASE_URL;

      if (!baseUrl) {
        logger.warn(
          "SCANDIA_FONT_BASE_URL not set, skipping font download. Headings will use the fallback font.",
        );
        return;
      }

      const fontDir = resolve(outDir, "fonts");

      await mkdir(fontDir, { recursive: true });

      await Promise.all(
        fontFiles.map(async (file) => {
          const res = await fetch(`${baseUrl}/${file}`);

          if (!res.ok) {
            throw new Error(`Failed to fetch ${file}: ${res.status}`);
          }

          const buf = Buffer.from(await res.arrayBuffer());

          await writeFile(resolve(fontDir, file), buf);
        }),
      );

      logger.info("  ✓ Scandia font fetched");
    },
  };
}
