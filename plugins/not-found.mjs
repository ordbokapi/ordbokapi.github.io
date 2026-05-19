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

const knownPaths = new Set(["/", "/personvern"]);

export default function notFoundPlugin() {
  return {
    name: "not-found-page",
    apply: "serve",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (
            req.method === "GET" &&
            req.headers.accept?.includes("text/html") &&
            req.url &&
            !req.url.startsWith("/@") &&
            !req.url.includes(".")
          ) {
            const path = req.url.replace(/\/+$/, "") || "/";

            if (!knownPaths.has(path)) {
              const originalWrite = res.writeHead.bind(res);

              req.url = "/index.html";
              res.writeHead = (statusCode, ...args) => {
                return originalWrite(404, ...args);
              };
            }
          }
          next();
        });
      };
    },
  };
}
