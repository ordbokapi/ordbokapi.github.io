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

import "./code-copy.css";

export function setupCodeCopy(container: HTMLElement) {
  const pres = container.querySelectorAll("pre");

  for (const pre of pres) {
    if (pre.querySelector(".code-copy-btn")) {
      continue;
    }

    const wrapper = document.createElement("div");

    wrapper.className = "code-copy-wrapper";
    pre.parentNode!.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement("button");

    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.setAttribute("aria-label", "Kopier kode");
    wrapper.appendChild(btn);

    btn.addEventListener("click", () => {
      const text =
        pre.querySelector("code")?.textContent ?? pre.textContent ?? "";

      navigator.clipboard.writeText(text).then(() => {
        btn.classList.add("copied");
        btn.setAttribute("aria-label", "Kopiert");

        setTimeout(() => {
          btn.classList.remove("copied");
          btn.setAttribute("aria-label", "Kopier kode");
        }, 2000);
      });
    });
  }
}
