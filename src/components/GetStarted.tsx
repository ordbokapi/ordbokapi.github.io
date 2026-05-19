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

import CodeBlock from "./CodeBlock";
import styles from "./GetStarted.module.css";

const fetchExample = `const response = await fetch(
  'https://api.ordbokapi.org/graphql',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: \`{
        suggestions(word: "forstå") {
          exact {
            word
            articles {
              wordClass
              flatDefinitions {
                content { textContent }
              }
            }
          }
        }
      }\`,
    }),
  },
);

const { data } = await response.json();`;

export default function GetStarted() {
  return (
    <section class={styles.section} aria-label="Kom i gang">
      <div class={styles.inner}>
        <h2 class={styles.heading}>Kom i gang</h2>
        <div class={styles.steps}>
          <div class={styles.step}>
            <span class={styles.stepNum} aria-hidden="true">
              1
            </span>
            <div>
              <h3 class={styles.stepTitle}>Utforsk skjemaet</h3>
              <p class="text-muted">
                Opne{" "}
                <a href="https://api.ordbokapi.org/graphql">Apollo Sandbox</a>{" "}
                og sjå kva du kan spørja etter.
              </p>
            </div>
          </div>
          <div class={styles.step}>
            <span class={styles.stepNum} aria-hidden="true">
              2
            </span>
            <div>
              <h3 class={styles.stepTitle}>Skriv ein førespurnad</h3>
              <p class="text-muted">
                Bruk ferdigdøma som eit utgangspunkt eller bygg dine eigne. Alt
                ligg dokumentert i skjemaet.
              </p>
            </div>
          </div>
          <div class={styles.step}>
            <span class={styles.stepNum} aria-hidden="true">
              3
            </span>
            <div>
              <h3 class={styles.stepTitle}>Integrer</h3>
              <p class="text-muted">
                Kall API-et frå kva som helst språk eller plattform med ein
                enkel HTTP-førespurnad.
              </p>
            </div>
          </div>
        </div>
        <div class={styles.codeExample}>
          <CodeBlock
            code={fetchExample}
            lang="javascript"
            label="Døme (JavaScript)"
          />
        </div>
      </div>
    </section>
  );
}
