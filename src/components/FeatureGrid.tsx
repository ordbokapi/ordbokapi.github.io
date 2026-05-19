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

import { For, type JSX } from "solid-js";
import Braces from "lucide-solid/icons/braces";
import BookOpen from "lucide-solid/icons/book-open";
import SlidersHorizontal from "lucide-solid/icons/sliders-horizontal";
import Network from "lucide-solid/icons/network";
import LockOpen from "lucide-solid/icons/lock-open";
import ShieldCheck from "lucide-solid/icons/shield-check";
import styles from "./FeatureGrid.module.css";

const features: { icon: () => JSX.Element; title: string; desc: string }[] = [
  {
    icon: () => <Braces size={28} />,
    title: "GraphQL",
    desc: "Spør berre etter dei dataa du treng, på ein intuitiv måte.",
  },
  {
    icon: () => <BookOpen size={28} />,
    title: "Tre ordbøker",
    desc: "Bokmålsordboka, Nynorskordboka og Norsk Ordbok samla i eitt API.",
  },
  {
    icon: () => <SlidersHorizontal size={28} />,
    title: "Fordeling og filtrering",
    desc: "Filtrer på ordklasse, kjønn, dialekt, etymologi og meir.",
  },
  {
    icon: () => <Network size={28} />,
    title: "Strukturert innhald",
    desc: "Definisjonar med lenkjer, formatering og kryssreferansar mellom artiklar.",
  },
  {
    icon: () => <LockOpen size={28} />,
    title: "Gratis og ope",
    desc: "Ingen API-nykel, ingen avgrensingar. AGPL-lisensiert fri programvare.",
  },
  {
    icon: () => <ShieldCheck size={28} />,
    title: "Påliteleg",
    desc: "Aktiv vedlikehald og 99% oppetid på statussida.",
  },
];

export default function FeatureGrid() {
  return (
    <section class={styles.section} aria-label="Funksjonar">
      <h2 class={styles.heading}>Kvifor bruke Ordbok API?</h2>
      <div class={styles.grid} role="list">
        <For each={features}>
          {(feat) => (
            <div class={styles.card} role="listitem">
              <span class={styles.icon} aria-hidden="true">
                {feat.icon()}
              </span>
              <h3 class={styles.cardTitle}>{feat.title}</h3>
              <p class="text-muted">{feat.desc}</p>
            </div>
          )}
        </For>
      </div>
    </section>
  );
}
