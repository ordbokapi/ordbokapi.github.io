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
import type { SearchQuery } from "~/lib/types";
import { ResultCardList, ResultCard, FacetChipList } from "./ResultParts";

const dictLabels: Record<string, string> = {
  Bokmaalsordboka: "Bokmål",
  Nynorskordboka: "Nynorsk",
  NorskOrdbok: "NO",
};

const wordClassAbbreviated: Record<string, string> = {
  Verb: "v.",
  Substantiv: "subst.",
  Adjektiv: "adj.",
  Adverb: "adv.",
  Pronomen: "pron.",
  Preposisjon: "prep.",
  Konjunksjon: "konj.",
  Interjeksjon: "interj.",
};

interface Props {
  data: SearchQuery;
}

export default function SearchResults(props: Props) {
  const articles = () => props.data.articles;

  return (
    <>
      <FacetChipList
        label="Fasettar"
        facets={articles().facets?.wordClass ?? []}
        labelMap={wordClassAbbreviated}
        max={4}
      />
      <ResultCardList fade>
        <For each={articles().edges.slice(0, 6)}>
          {(edge) => {
            const node = edge.node;
            const firstDef = node.flatDefinitions?.find(
              (d) => d.parentIndex === null,
            );
            const meta = [
              dictLabels[node.dictionary] ?? node.dictionary,
              node.wordClass
                ? (wordClassAbbreviated[node.wordClass] ?? node.wordClass)
                : "",
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <ResultCard
                title={node.lemmas?.[0]?.lemma ?? ""}
                meta={meta}
                def={firstDef?.content[0]?.textContent}
              />
            );
          }}
        </For>
      </ResultCardList>
    </>
  );
}
