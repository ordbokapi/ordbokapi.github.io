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

import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div class={styles.page}>
      <h1>404</h1>
      <p class={styles.subtitle}>Sida finst ikkje</p>
      <p class={styles.description}>
        Me fann ikkje sida du leita etter. Ho kan ha vorte flytta eller sletta.
      </p>
      <a href="/" class="btn btn-primary">
        Til framsida
      </a>
    </div>
  );
}
