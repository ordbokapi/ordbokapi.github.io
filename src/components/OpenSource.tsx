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

import styles from "./OpenSource.module.css";

export default function OpenSource() {
  return (
    <section class={styles.section} aria-label="Open kjeldekode">
      <h2 class={styles.heading}>Bygd i det opne</h2>
      <p class={styles.desc}>
        Ordbok API er fri programvare, lisensiert under AGPL-3.0-or-later. All
        kjeldekode er open, bidrag er velkomne og prosjektet er drive av
        fellesskapet. Språkdata bør vera tilgjengeleg for alle utan atterhald.
      </p>
      <a href="https://github.com/ordbokapi/api" class="btn btn-primary">
        Sjå prosjektet på GitHub
      </a>
    </section>
  );
}
