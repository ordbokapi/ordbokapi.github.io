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

import type { Logger, Plugin, ViteDevServer } from "vite";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { format } from "prettier";
import { loadEnv } from "vite";
import LZString from "lz-string";

const queriesPath = resolve(import.meta.dirname, "../src/lib/queries.ts");
const graphqlDir = resolve(import.meta.dirname, "../src/lib/graphql");

async function loadShowcaseQueries() {
  const mod = await import(`${queriesPath}?t=${Date.now()}`);

  return mod.showcaseQueries;
}

const virtualId = "virtual:showcase-data";
const resolvedId = "\0" + virtualId;

async function readQuery(name: string): Promise<string> {
  return await readFile(resolve(graphqlDir, `${name}.graphql`), "utf-8");
}

async function fetchQuery(
  apiUrl: string,
  query: string,
  variables: Record<string, unknown> | undefined,
) {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (json.errors) {
    throw new Error(
      `GraphQL errors:\n${json.errors.map((e: { message: string }) => e.message).join("\n")}`,
    );
  }

  return json.data;
}

async function formatJson(data: unknown): Promise<string> {
  const raw = JSON.stringify(data);
  return await format(raw, { parser: "json", printWidth: 60 });
}

function sandboxUrl(
  apiUrl: string,
  document: string,
  variables: Record<string, unknown> | undefined,
): string {
  const state = JSON.stringify({
    document,
    ...(variables ? { variables: JSON.stringify(variables, null, 2) } : {}),
  });
  const encoded = LZString.compressToEncodedURIComponent(state);

  return `${apiUrl}?explorerURLState=${encoded}`;
}

async function fetchAllShowcaseData(apiUrl: string) {
  const showcaseQueries = (await loadShowcaseQueries()) as Record<
    string,
    { display: string; file: string; variables?: Record<string, unknown> }
  >;

  const entries = await Promise.all(
    Object.entries(showcaseQueries).map(
      async ([key, { display, file, variables }]) => {
        const query = await readQuery(file);
        const [data, displayData] = await Promise.all([
          fetchQuery(apiUrl, query, variables),
          fetchQuery(apiUrl, display, variables),
        ]);
        const formatted = await formatJson(displayData);
        const url = sandboxUrl(apiUrl, display, variables);

        return [key, { data, formatted, url }];
      },
    ),
  );

  const result = Object.fromEntries(entries);
  const keys = Object.keys(showcaseQueries);

  return {
    data: Object.fromEntries(keys.map((key) => [key, result[key].data])),
    formatted: Object.fromEntries(
      keys.map((key) => [key, result[key].formatted]),
    ),
    sandboxUrls: Object.fromEntries(keys.map((key) => [key, result[key].url])),
  };
}

const dictLabels = {
  Bokmaalsordboka: "Bokmålsordboka",
  Nynorskordboka: "Nynorskordboka",
  NorskOrdbok: "Norsk Ordbok",
};

function buildShowcaseMeta(data: Record<string, any>) {
  const exact = data.lookup?.suggestions?.exact?.[0];
  return {
    lookup: {
      word: exact?.word ?? "",
      labels: (exact?.articles ?? []).map(
        (a: { dictionary: string }) =>
          dictLabels[a.dictionary as keyof typeof dictLabels] ?? a.dictionary,
      ),
    },
  };
}

export default function showcaseDataPlugin(): Plugin {
  let cachedModule: string | null = null;
  let apiUrl = "https://api.ordbokapi.org/graphql";
  let logger: Logger;
  let server: ViteDevServer | undefined;

  return {
    name: "showcase-data",

    configResolved(config) {
      const env = loadEnv(config.mode, config.root, "VITE_");

      apiUrl =
        env.VITE_API_URL ||
        process.env.VITE_API_URL ||
        "https://api.ordbokapi.org/graphql";
      logger = config.logger;
    },

    configureServer(s) {
      server = s;

      s.middlewares.use((req, _res, next) => {
        // Invalidate cached showcase data on every page reload so the dev
        // server always fetches fresh data from the API.
        if (req.url === "/" || req.url?.endsWith(".html")) {
          const mod = s.moduleGraph.getModuleById(resolvedId);
          if (mod) {
            s.moduleGraph.invalidateModule(mod);
          }
          cachedModule = null;
        }
        next();
      });
    },

    resolveId(id) {
      if (id === virtualId) {
        return resolvedId;
      }
    },

    async load(id) {
      if (id !== resolvedId) {
        return;
      }

      if (cachedModule && !server) {
        return cachedModule;
      }

      logger.info("Fetching showcase data from " + apiUrl, {
        timestamp: true,
      });

      const { data, formatted, sandboxUrls } =
        await fetchAllShowcaseData(apiUrl);

      const meta = buildShowcaseMeta(data);

      cachedModule = `
export const showcaseData = ${JSON.stringify(data)};
export const formattedResponses = ${JSON.stringify(formatted)};
export const sandboxUrls = ${JSON.stringify(sandboxUrls)};
export const showcaseMeta = ${JSON.stringify(meta)};
`;

      logger.info("Showcase data ready.", { timestamp: true });
      return cachedModule;
    },

    handleHotUpdate({ file }) {
      if (
        (file.includes("/graphql/") && file.endsWith(".graphql")) ||
        file.includes("/queries/")
      ) {
        cachedModule = null;

        if (server) {
          const mod = server.moduleGraph.getModuleById(resolvedId);

          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        }
      }
    },
  };
}
