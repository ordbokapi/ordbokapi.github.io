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

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer class={styles.footer}>
      <div class={styles.inner}>
        <div class={styles.about}>
          <p class={styles.heading}>Ordbok API</p>
          <p>
            Eit ope og gratis GraphQL API for norske ordbøker. Bygd og
            vedlikehalde av{" "}
            <a href="https://github.com/adalinesimonian">Adaline Simonian</a>{" "}
            som eit uavhengig samfunnsprosjekt.
          </p>
          <p>
            Tekst og data frå ordbøkene er ©{" "}
            <a href="https://www.sprakradet.no/">Språkrådet</a> og{" "}
            <a href="https://www.uib.no/">Universitetet i Bergen</a>, henta frå{" "}
            <a href="https://ordbokene.no/">ordbokene.no</a>.
          </p>
        </div>
        <div>
          <p class={styles.heading}>Lenkjer</p>
          <ul class={styles.linkList}>
            <li>
              <a href="https://api.ordbokapi.org/graphql">Apollo Sandbox</a>
            </li>
            <li>
              <a href="https://vis.ordbokapi.org">Vis-klient</a>
            </li>
            <li>
              <a href="https://github.com/ordbokapi/api">GitHub</a>
            </li>
            <li>
              <a href="https://blog.ordbokapi.org/">Blogg</a>
            </li>
            <li>
              <a href="https://status.ordbokapi.org/">Status</a>
            </li>
          </ul>
        </div>
        <div>
          <p class={styles.heading}>Meir</p>
          <ul class={styles.linkList}>
            <li>
              <a href="/personvern/">Personvern</a>
            </li>
            <li>
              <a href="https://github.com/ordbokapi/api/blob/main/COPYING">
                Lisens (AGPL-3.0+)
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class={styles.bottom}>
        <p>
          © 2023-2026 Adaline Simonian. Lisensiert under{" "}
          <a href="https://github.com/ordbokapi/ordbokapi.github.io/blob/main/COPYING">
            AGPL-3.0-or-later
          </a>
          .
        </p>
        <p>
          Dette prosjektet har inga tilknyting til Universitetet i Bergen eller
          Språkrådet.
        </p>
      </div>
    </footer>
  );
}
