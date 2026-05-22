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

import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import { Resvg } from "@resvg/resvg-js";
import { optimize } from "svgo";

const root = resolve(import.meta.dirname, "..");
const srcLight = resolve(root, "scripts/ordbokapilogo-lightmode.svg");
const srcDark = resolve(root, "scripts/ordbokapilogo-darkmode.svg");
const outDir = resolve(root, "public/images");

const paddingFraction = 0.125;

async function generateIcon(svgPath: string, size: number, output: string) {
  const svgContent = await readFile(svgPath, "utf-8");

  const viewBoxMatch = svgContent.match(
    /viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/,
  );

  if (!viewBoxMatch) {
    throw new Error("Could not parse viewBox from SVG.");
  }

  const logoWidth = parseFloat(viewBoxMatch[1]);
  const logoHeight = parseFloat(viewBoxMatch[2]);

  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);

  if (!innerMatch) {
    throw new Error("Could not parse SVG content.");
  }

  const inner = innerMatch[1];

  const contentSize = size * (1 - 2 * paddingFraction);
  const scale = contentSize / Math.max(logoWidth, logoHeight);
  const contentWidth = logoWidth * scale;
  const contentHeight = logoHeight * scale;
  const offsetX = (size - contentWidth) / 2;
  const offsetY = (size - contentHeight) / 2;

  const wrapperSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <g transform="translate(${offsetX}, ${offsetY}) scale(${contentWidth / logoWidth})">
    ${inner}
  </g>
</svg>`;

  const resvg = new Resvg(wrapperSvg, {
    fitTo: { mode: "width", value: size },
  });
  const pngData = resvg.render();
  await writeFile(output, pngData.asPng());
  console.log(`Generated ${output} (${size}x${size})`);
}

const sizes: [number, string][] = [
  [16, "favicon-16x16.png"],
  [32, "favicon-32x32.png"],
  [180, "apple-touch-icon.png"],
  [192, "android-chrome-192x192.png"],
  [512, "android-chrome-512x512.png"],
];

for (const [size, filename] of sizes) {
  await generateIcon(srcLight, size, resolve(outDir, filename));
}

async function generateFavicon() {
  const [lightSvg, darkSvg] = await Promise.all([
    readFile(srcLight, "utf-8"),
    readFile(srcDark, "utf-8"),
  ]);

  const viewBoxMatch = lightSvg.match(
    /viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/,
  );

  if (!viewBoxMatch) {
    throw new Error("Could not parse viewBox from SVG.");
  }

  const logoWidth = parseFloat(viewBoxMatch[1]);
  const logoHeight = parseFloat(viewBoxMatch[2]);

  const innerMatch = lightSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);

  if (!innerMatch) {
    throw new Error("Could not parse SVG content.");
  }

  let inner = innerMatch[1];

  // Find fills that differ between light and dark mode.
  const lightFills = [
    ...lightSvg.matchAll(/fill[=:]["']?(#[0-9a-fA-F]{3,8})/g),
  ].map((m) => m[1].toLowerCase());

  const darkFills = [
    ...darkSvg.matchAll(/fill[=:]["']?(#[0-9a-fA-F]{3,8})/g),
  ].map((m) => m[1].toLowerCase());

  const colorMap = new Map<string, string>();

  for (let i = 0; i < lightFills.length; i++) {
    if (lightFills[i] !== darkFills[i] && !colorMap.has(lightFills[i])) {
      colorMap.set(lightFills[i], darkFills[i]);
    }
  }

  let classIndex = 0;
  const cssRules: string[] = [];
  const darkRules: string[] = [];

  for (const [lightColor, darkColor] of colorMap) {
    const className = `c${classIndex++}`;

    inner = inner.replaceAll(
      new RegExp(
        `style="([^"]*?)fill:${lightColor.replace("#", "\\#")}([^"]*?)"`,
        "gi",
      ),
      `class="${className}" style="$1$2"`,
    );

    inner = inner.replaceAll(
      new RegExp(`fill="${lightColor}"`, "gi"),
      `class="${className}"`,
    );

    cssRules.push(`.${className} { fill: ${lightColor}; }`);
    darkRules.push(`.${className} { fill: ${darkColor}; }`);
  }

  inner = inner.replaceAll(/style="\s*"/g, "");

  const canvasSize =
    Math.max(logoWidth, logoHeight) / (1 - 2 * paddingFraction);
  const offsetX = (canvasSize - logoWidth) / 2;
  const offsetY = (canvasSize - logoHeight) / 2;

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}">
<style>
  ${cssRules.join("\n  ")}
  @media (prefers-color-scheme: dark) {
    ${darkRules.join("\n    ")}
  }
</style>
<g transform="translate(${offsetX}, ${offsetY})">
  ${inner}
</g>
</svg>
`;

  const optimized = optimize(faviconSvg, {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            inlineStyles: false,
            minifyStyles: false,
          },
        },
      },
    ],
  });

  const output = resolve(outDir, "favicon.svg");

  await writeFile(output, optimized.data);

  console.log(`Generated ${output}`);
}

await generateFavicon();

const logoSources: [string, string][] = [
  [srcLight, "ordbokapi-logo-light.svg"],
  [srcDark, "ordbokapi-logo-dark.svg"],
];

for (const [src, filename] of logoSources) {
  const svg = await readFile(src, "utf-8");
  const optimized = optimize(svg);
  const output = resolve(outDir, filename);

  await writeFile(output, optimized.data);

  console.log(`Generated ${output}`);
}

console.log("All icons generated!");
