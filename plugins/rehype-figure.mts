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

export default function rehypeFigure() {
  return (tree: Parameters<ReturnType<typeof rehypeRaw>>[0]) => {
    visit(tree, "element", (node, index, parent) => {
      if (
        node.tagName !== "img" ||
        index == null ||
        !parent ||
        !node.properties.title
      ) {
        return;
      }

      const props = node.properties;
      const caption = String(props.title);

      delete props.title;

      parent.children[index] = {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          node,
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: caption }],
          },
        ],
      };
    });
  };
}
