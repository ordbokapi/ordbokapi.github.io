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

import { For } from "solid-js";
import type { JSX } from "solid-js";
import styles from "./ResultParts.module.css";

export function ResultContainer(props: {
  label: string;
  children: JSX.Element;
}): JSX.Element {
  return (
    <div class={styles.container} role="region" aria-label={props.label}>
      {props.children}
    </div>
  );
}

export function ResultCardList(props: {
  fade?: boolean;
  children: JSX.Element;
}): JSX.Element {
  return (
    <div
      class={`${styles.cards} ${props.fade ? styles.cardsFade : ""}`}
      role="list"
      aria-label="Resultat"
    >
      {props.children}
    </div>
  );
}

export function ResultCard(props: {
  title: string | JSX.Element;
  meta?: string;
  def?: string;
}): JSX.Element {
  return (
    <div class={styles.card} role="listitem">
      <div class={styles.cardHead}>
        <span class={styles.cardTitle}>{props.title}</span>
        {props.meta && <span class={styles.cardMeta}>{props.meta}</span>}
      </div>
      {props.def && <div class={styles.cardDef}>{props.def}</div>}
    </div>
  );
}

export function ChipList(props: {
  label: string;
  fade?: boolean;
  children: JSX.Element;
}): JSX.Element {
  return (
    <div
      class={`${styles.chips} ${props.fade ? styles.chipsFade : ""}`}
      role="list"
      aria-label={props.label}
    >
      {props.children}
    </div>
  );
}

export function Chip(props: {
  text: string;
  annotation?: string;
  extra?: boolean;
}): JSX.Element {
  return (
    <span
      class={`${styles.chip} ${props.extra ? styles.chipExtra : ""}`}
      role="listitem"
    >
      {props.text}
      {props.annotation && (
        <span class={styles.chipAnnotation}>{props.annotation}</span>
      )}
    </span>
  );
}

export function FacetChipList(props: {
  label: string;
  facets: { value: string; count: number }[];
  labelMap?: Record<string, string>;
  max?: number;
}): JSX.Element {
  return (
    <div class={styles.facetChips} role="list" aria-label={props.label}>
      <For each={props.facets.slice(0, props.max ?? 4)}>
        {(f) => (
          <span class={styles.facetChip} role="listitem">
            <span class={styles.facetChipValue}>{f.count}</span>{" "}
            {props.labelMap?.[f.value] ?? f.value}
          </span>
        )}
      </For>
    </div>
  );
}
