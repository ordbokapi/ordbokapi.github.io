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

import type { Plugin } from "vite";
import lucide from "lucide-static";

const virtualId = "virtual:blog-icons.css";
const resolvedId = "\0" + virtualId;

const icons: Record<string, string> = {
  note: lucide.Info,
  tip: lucide.Lightbulb,
  important: lucide.CircleAlert,
  warning: lucide.TriangleAlert,
  caution: lucide.OctagonAlert,
  link: lucide.Link,
  copy: lucide.Copy,
  check: lucide.Check,
  "arrow-right": lucide.ArrowRight,
};

function toDataUri(svg: string): string {
  const clean = svg.replace(/\n\s*/g, " ").trim();

  return `url("data:image/svg+xml,${encodeURIComponent(clean)}")`;
}

export default function blogIconsPlugin(): Plugin {
  return {
    name: "blog-icons",

    resolveId(id) {
      if (id === virtualId) {
        return resolvedId;
      }
    },

    load(id) {
      if (id !== resolvedId) {
        return;
      }

      const calloutNames = new Set([
        "note",
        "tip",
        "important",
        "warning",
        "caution",
      ]);

      const calloutRules = Object.entries(icons)
        .filter(([name]) => calloutNames.has(name))
        .map(
          ([name, svg]) =>
            `.callout-${name} .callout-title::before {\n  mask-image: ${toDataUri(svg)};\n}`,
        )
        .join("\n\n");

      const headingRule = `.heading-anchor::after {\n  mask-image: ${toDataUri(icons.link)};\n}`;

      const codeCopyRule = `.code-copy-btn::before {\n  mask-image: ${toDataUri(icons.copy)};\n}`;
      const codeCopiedRule = `.code-copy-btn.copied::before {\n  mask-image: ${toDataUri(icons.check)};\n}`;
      const sandboxTryIcon = `.sandbox-try-icon {\n  mask-image: ${toDataUri(icons["arrow-right"])};\n}`;

      return `${calloutRules}\n\n${headingRule}\n\n${codeCopyRule}\n\n${codeCopiedRule}\n\n${sandboxTryIcon}\n`;
    },
  };
}
