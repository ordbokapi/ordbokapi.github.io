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

import "./sandbox-query.css";

export function setupSandboxTabs(container: HTMLElement) {
  const blocks = container.querySelectorAll<HTMLElement>(
    ".sandbox-query-block",
  );

  for (const block of blocks) {
    const tablist = block.querySelector<HTMLElement>('[role="tablist"]');

    if (!tablist) {
      continue;
    }

    const tabs = tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const panels = block.querySelectorAll<HTMLElement>('[role="tabpanel"]');

    function activate(index: number) {
      tabs.forEach((tab, i) => {
        const selected = i === index;

        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        tab.classList.toggle("sandbox-tab-active", selected);
      });

      panels.forEach((panel, i) => {
        panel.classList.toggle("sandbox-panel-hidden", i !== index);
      });
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => activate(i));
    });

    tablist.addEventListener("keydown", (e) => {
      const count = tabs.length;
      let current = Array.from(tabs).findIndex(
        (t) => t.getAttribute("aria-selected") === "true",
      );

      if (e.key === "ArrowRight") {
        current = (current + 1) % count;
      } else if (e.key === "ArrowLeft") {
        current = (current - 1 + count) % count;
      } else if (e.key === "Home") {
        current = 0;
      } else if (e.key === "End") {
        current = count - 1;
      } else {
        return;
      }

      e.preventDefault();
      activate(current);
      tabs[current].focus();
    });
  }
}
