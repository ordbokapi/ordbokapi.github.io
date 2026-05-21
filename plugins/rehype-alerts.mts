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

import type rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";

const alertTypes: Record<string, string> = {
  note: "Merk",
  tip: "Tips",
  important: "Viktig",
  warning: "Åtvaring",
  caution: "Forsiktig",
};

export default function rehypeAlerts() {
  return (tree: Parameters<ReturnType<typeof rehypeRaw>>[0]) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "blockquote" || index == null || !parent) {
        return;
      }

      const children = node.children;
      const firstP = children.find(
        (c) => c.type === "element" && c.tagName === "p",
      );

      if (!firstP || !("children" in firstP) || !firstP.children?.length) {
        return;
      }

      const firstText = firstP.children[0];

      if (firstText.type !== "text" || !firstText.value) {
        return;
      }

      const match = firstText.value.match(
        /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
      );

      if (!match) {
        return;
      }

      const type = match[1].toLowerCase();
      const title = alertTypes[type] ?? match[1];

      firstText.value = firstText.value.slice(match[0].length);

      if (!firstText.value) {
        firstP.children.shift();
      }

      if (!firstP.children.length) {
        const idx = children.indexOf(firstP);

        if (idx !== -1) {
          children.splice(idx, 1);
        }
      }

      const titleNode = {
        type: "element" as const,
        tagName: "p",
        properties: { className: ["callout-title"] },
        children: [{ type: "text" as const, value: title }],
      };

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["callout", `callout-${type}`] },
        children: [titleNode, ...children],
      };
    });
  };
}
