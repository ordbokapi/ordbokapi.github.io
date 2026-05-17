// SPDX-FileCopyrightText: Copyright (C) 2023 Adaline Simonian
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

export class GraphDataProvider {
  getRandomData() {
    const articleParameters = [
      { articleId: 100431, dictionary: "Nynorskordboka", depth: 2 },
      { articleId: 44132, dictionary: "Nynorskordboka", depth: 1 },
      { articleId: 38531, dictionary: "Nynorskordboka", depth: 2 },
      { articleId: 18652, dictionary: "Bokmaalsordboka", depth: 3 },
    ];
    const randomIndex = Math.floor(Math.random() * articleParameters.length);
    const { articleId, dictionary, depth } = articleParameters[randomIndex];

    return this.getArticleData(articleId, dictionary, depth);
  }

  getArticleData(articleId, dictionary, depth) {
    const url = `https://api.ordbokapi.org/graphql`;
    const query = `query ArticleGraphQuery($articleId: Int!, $dictionary: Dictionary!, $depth: Int!) {
articleGraph(id: $articleId, dictionary: $dictionary, depth: $depth) {
  nodes {
    id
    lemmas {
      lemma
    }
  }
  edges {
    sourceId
    targetId
  }
}
}
`;

    const variables = {
      articleId,
      dictionary,
      depth,
    };

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.errors)
          throw new Error(data.errors.map((error) => error.message).join("\n"));
        return data;
      })
      .then((data) => this.convertToD3Graph(data.data.articleGraph))
      .catch((error) => console.error(error));
  }

  convertToD3Graph(graphData) {
    const nodes = graphData.nodes.map((node) => ({
      id: node.id,
      text: node.lemmas[0].lemma,
    }));
    const links = graphData.edges.map((edge) => ({
      source: edge.sourceId,
      target: edge.targetId,
    }));

    console.log({ nodes, links });

    return { nodes, links };
  }
}
