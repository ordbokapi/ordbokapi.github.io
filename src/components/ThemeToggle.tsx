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

import { createSignal, createEffect, onCleanup, Show } from "solid-js";
import Sun from "lucide-solid/icons/sun";
import Moon from "lucide-solid/icons/moon";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  return (localStorage.getItem("theme") as Theme) ?? "system";
}

export function ThemeToggle() {
  const [theme, setTheme] = createSignal<Theme>(getStoredTheme());

  createEffect(() => {
    const t = theme();

    if (typeof document === "undefined") {
      return;
    }

    if (t === "system") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("theme");
    } else {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("theme", t);
    }
  });

  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme() === "system") {
        setTheme("system");
      }
    };

    mql.addEventListener("change", handler);
    onCleanup(() => mql.removeEventListener("change", handler));
  });

  const cycle = () => {
    const current = theme();
    const resolved = current === "system" ? getSystemTheme() : current;

    setTheme(resolved === "light" ? "dark" : "light");
  };

  const label = () => {
    const t = theme();

    if (t === "system") {
      return "Systemtema";
    } else if (t === "light") {
      return "Lyst tema";
    } else {
      return "Mørkt tema";
    }
  };

  const isDark = () => {
    const t = theme();
    const resolved = t === "system" ? getSystemTheme() : t;

    return resolved === "dark";
  };

  return (
    <button
      class="theme-toggle"
      onClick={cycle}
      aria-label={label()}
      title={label()}
      type="button"
    >
      <span aria-hidden="true">
        <Show when={isDark()} fallback={<Moon size={18} />}>
          <Sun size={18} />
        </Show>
      </span>
    </button>
  );
}
