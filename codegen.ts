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

import type { CodegenConfig } from "@graphql-codegen/cli";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "VITE_");

const config: CodegenConfig = {
  schema: env.VITE_API_URL || "https://api.ordbokapi.org/graphql",
  documents: ["src/lib/graphql/**/*.graphql"],
  generates: {
    "src/lib/generated/": {
      preset: "client",
      config: {
        useTypeImports: true,
        scalars: {
          DateTime: "string",
        },
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
