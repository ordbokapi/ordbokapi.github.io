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

import { createSignal, createEffect, onCleanup } from "solid-js";
import Menu from "lucide-solid/icons/menu";
import X from "lucide-solid/icons/x";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Nav.module.css";

const navLinks = [
  { href: "https://api.ordbokapi.org/graphql", label: "Apollo Sandbox" },
  { href: "https://vis.ordbokapi.org", label: "Vis-klient" },
  { href: "https://github.com/ordbokapi/api", label: "GitHub" },
  { href: "/blogg/", label: "Blogg" },
  { href: "https://status.ordbokapi.org/", label: "Status" },
];

export default function Nav() {
  const [scrolled, setScrolled] = createSignal(false);
  const [menuOpen, setMenuOpen] = createSignal(false);

  createEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = () => setScrolled(window.scrollY > 8);

    window.addEventListener("scroll", handler, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", handler));
  });

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        class={`${styles.nav} ${scrolled() ? styles.scrolled : ""}`}
        aria-label="Hovudnavigasjon"
      >
        <div class={styles.navInner}>
          <a href="/" class={styles.logo}>
            <img
              src="/images/ordbokapi-logo.png"
              alt=""
              class={styles.logoImg}
              width="36"
              height="36"
            />
            Ordbok API
          </a>
          <div class={styles.spacer} />
          <div class={styles.links}>
            {navLinks.map((link) => (
              <a href={link.href}>{link.label}</a>
            ))}
            <ThemeToggle />
          </div>
          <button
            class={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen())}
            aria-expanded={menuOpen()}
            aria-controls="mobile-menu"
            aria-label={menuOpen() ? "Lukk meny" : "Opne meny"}
            type="button"
          >
            <span aria-hidden="true">
              {menuOpen() ? <X size={24} /> : <Menu size={24} />}
            </span>
          </button>
        </div>
      </nav>
      <div
        id="mobile-menu"
        class={`${styles.mobileMenu} ${menuOpen() ? styles.open : ""}`}
        role="navigation"
        aria-label="Mobilmeny"
        inert={!menuOpen()}
      >
        <div class={styles.mobileMenuInner}>
          {navLinks.map((link) => (
            <a href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
          <div style={{ padding: "10px 12px" }}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
