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
import type { ArticleGraphQuery } from "~/lib/types";
import styles from "./WordGraph.module.css";

let d3Force: typeof import("d3-force") | null = null;

if (import.meta.env.SSR || import.meta.env.DEV) {
  d3Force = await import("d3-force");
}

interface LayoutNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface LayoutEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Props {
  data: ArticleGraphQuery;
  centerArticleId: number;
}

const width = 420;
const height = 320;

function computeLayout(
  data: ArticleGraphQuery,
): { nodes: LayoutNode[]; edges: LayoutEdge[] } | null {
  if (!d3Force) {
    return null;
  }

  const graph = data.articleGraph;
  if (!graph) {
    return null;
  }

  const {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
  } = d3Force;

  const nodes = graph.nodes.map((node) => ({
    id: node.id,
    label: node.lemmas?.[0]?.lemma ?? `#${node.id}`,
  }));

  const edges = graph.edges.map((edge) => ({
    source: edge.sourceId,
    target: edge.targetId,
  }));

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  const sim = forceSimulation(nodes as any)
    .force(
      "link",
      forceLink(edges as any)
        .id((d: any) => d.id)
        .distance(60),
    )
    .force("charge", forceManyBody().strength(-120))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide(30))
    .stop();

  for (let i = 0; i < 200; i++) {
    sim.tick();
  }

  return {
    nodes: nodes.map((node: any) => ({
      id: node.id,
      x: node.x ?? width / 2,
      y: node.y ?? height / 2,
      label: node.label,
    })),
    edges: edges.map((edge: any) => {
      const src =
        typeof edge.source === "object"
          ? edge.source
          : nodeMap.get(edge.source);
      const tgt =
        typeof edge.target === "object"
          ? edge.target
          : nodeMap.get(edge.target);
      return {
        x1: src?.x ?? 0,
        y1: src?.y ?? 0,
        x2: tgt?.x ?? 0,
        y2: tgt?.y ?? 0,
      };
    }),
  };
}

export default function WordGraph(props: Props) {
  const layout = computeLayout(props.data);

  return (
    <div class={styles.graphWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
        <For each={layout?.edges ?? []}>
          {(e) => (
            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} class={styles.edge} />
          )}
        </For>
        <For each={layout?.nodes ?? []}>
          {(n) => (
            <g class={styles.node}>
              <circle
                cx={n.x}
                cy={n.y}
                r={n.id === props.centerArticleId ? 8 : 6}
                class={`${styles.nodeCircle} ${n.id === props.centerArticleId ? styles.center : ""}`}
              />
              <text x={n.x} y={n.y - 12} class={styles.nodeLabel}>
                {n.label}
              </text>
            </g>
          )}
        </For>
      </svg>
    </div>
  );
}
