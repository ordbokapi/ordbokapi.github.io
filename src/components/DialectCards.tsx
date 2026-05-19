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
import type { DialectWordsQuery } from "~/lib/types";
import { ResultCardList, ResultCard } from "./ResultParts";

interface Props {
  data: DialectWordsQuery;
}

export default function DialectCards(props: Props) {
  const articles = () => props.data.articles;

  const cards = () => {
    const result: { form: string; lemma: string; def?: string }[] = [];

    for (const edge of articles().edges) {
      if (result.length >= 6) {
        break;
      }

      const node = edge.node;
      const lemma = node.lemmas?.[0]?.lemma;
      const forms =
        node.dialect
          ?.flatMap((d) => d.subcategories)
          .flatMap((sc) => sc.forms)
          .filter((f) => f.form !== lemma) ?? [];

      if (forms.length === 0) {
        continue;
      }

      const formText = forms
        .slice(0, 2)
        .map((f) => f.form)
        .join(", ");
      const firstDef = node.flatDefinitions?.find(
        (d) => d.parentIndex === null,
      );

      result.push({
        form: formText,
        lemma: lemma ?? "",
        def: firstDef?.content[0]?.textContent,
      });
    }

    return result;
  };

  return (
    <ResultCardList fade>
      <For each={cards()}>
        {(card) => (
          <ResultCard title={card.form} meta={card.lemma} def={card.def} />
        )}
      </For>
    </ResultCardList>
  );
}
