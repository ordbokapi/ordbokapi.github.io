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

export interface ShowcaseQuery {
  display: string;
  file: string;
  variables?: Record<string, unknown>;
}

export const showcaseQueries = {
  lookup: {
    display: `query LookUp($word: String!) {
  suggestions(word: $word) {
    exact {
      word
      articles {
        id
        dictionary
        wordClass
        gender
        flatDefinitions {
          parentIndex
          content { textContent }
          examples { textContent }
        }
      }
    }
  }
}`,
    file: "lookup",
    variables: { word: "forstå" },
  },
  dialect: {
    display: `query DialectWords($place: String!) {
  articles(
    dictionaries: [NorskOrdbok]
    filter: {
      wordClass: Substantiv
      dialectPlace: { name: { eq: $place } }
    }
  ) {
    totalCount
    edges {
      node {
        lemmas { lemma }
        dialect(
          filter: { place: { name: { eq: $place } } }
        ) {
          subcategories {
            forms { form }
          }
        }
      }
    }
  }
}`,
    file: "dialect",
    variables: { place: "Bergen" },
  },
  norseOrigin: {
    display: `query NorseOriginNouns {
  articles(
    dictionaries: [Nynorskordboka]
    filter: {
      wordClass: Substantiv
      etymologyLanguage: Norroent
    }
  ) {
    totalCount
    facets {
      gender { value count }
    }
    edges {
      node {
        lemmas { lemma }
        gender
      }
    }
  }
}`,
    file: "norse",
  },
  search: {
    display: `query Search(
  $filter: ArticleFilter!
  $dictionaries: [Dictionary!]!
) {
  articles(
    filter: $filter
    dictionaries: $dictionaries
  ) {
    totalCount
    facets { wordClass { value count } }
    edges {
      node {
        dictionary
        lemmas { lemma }
        wordClass
        flatDefinitions {
          parentIndex
          content { textContent }
        }
      }
    }
  }
}`,
    file: "search",
    variables: {
      filter: { etymologyLanguage: "Fransk", lemma: { contains: "sj" } },
      dictionaries: ["Bokmaalsordboka", "Nynorskordboka"],
    },
  },
  graph: {
    display: `query ArticleGraph(
  $articleId: Int!
  $dictionary: Dictionary!
  $depth: Int!
) {
  articleGraph(
    id: $articleId
    dictionary: $dictionary
    depth: $depth
  ) {
    nodes { id lemmas { lemma } }
    edges { sourceId targetId }
  }
}`,
    file: "article-graph",
    variables: { articleId: 100431, dictionary: "Nynorskordboka", depth: 2 },
  },
} as const satisfies Record<string, ShowcaseQuery>;
