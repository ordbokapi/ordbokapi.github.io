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
import type { NorseOriginNounsQuery } from "~/lib/types";
import { ChipList, Chip, FacetChipList } from "./ResultParts";

const genderLabels: Record<string, string> = {
  Hankjoenn: "m.",
  Hokjoenn: "f.",
  Inkjekjoenn: "n.",
  HankjoennHokjoenn: "m./f.",
};

const genderFull: Record<string, string> = {
  Hankjoenn: "hankjønn",
  Hokjoenn: "hokjønn",
  Inkjekjoenn: "inkjekjønn",
  HankjoennHokjoenn: "hankjønn/hokjønn",
};

interface Props {
  data: NorseOriginNounsQuery;
}

export default function EtymologySummary(props: Props) {
  const articles = () => props.data.articles;

  return (
    <>
      <FacetChipList
        label="Fordeling etter kjønn"
        facets={articles().facets?.gender ?? []}
        labelMap={genderFull}
      />
      <ChipList label="Døme på ord" fade>
        <For each={articles().edges.slice(0, 50)}>
          {(edge) => (
            <Chip
              text={edge.node.lemmas?.[0]?.lemma ?? ""}
              annotation={genderLabels[edge.node.gender ?? ""] ?? ""}
            />
          )}
        </For>
      </ChipList>
    </>
  );
}
