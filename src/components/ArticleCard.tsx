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

import { For, Show, createContext, useContext } from "solid-js";
import type { JSX } from "solid-js";
import type { LookUpQuery } from "~/lib/types";
import styles from "./DictionaryEntry.module.css";

export type Article = NonNullable<
  LookUpQuery["suggestions"]["exact"][0]["articles"]
>[number];

type CitationRef = {
  code: string;
  author?: string | null;
  title?: string | null;
  year?: string | null;
  spec?: { textContent: string } | null;
};

type RichSegment = {
  type: string;
  content: string;
  formatted?: string;
  article?: { id: number; dictionary: string };
  reference?: {
    code: string;
    author?: string | null;
    title?: string | null;
    year?: string | null;
    spec?: { textContent: string } | null;
  };
  place?: {
    id: number;
    name: string;
    code?: string | null;
    type?: string | null;
  };
};

type FlatDef = {
  parentIndex: number | null;
  content: { textContent: string; richContent: RichSegment[] }[];
  examples: { textContent: string; richContent?: RichSegment[] }[];
};

type CitationMap = { get(code: string): number | undefined };
const CitationContext = createContext<() => CitationMap>(() => new Map());

const dictLabels: Record<string, string> = {
  Bokmaalsordboka: "Bokmålsordboka",
  Nynorskordboka: "Nynorskordboka",
  NorskOrdbok: "Norsk Ordbok",
};

const wordClassLabels: Record<string, string> = {
  Verb: "verb",
  Substantiv: "substantiv",
  Adjektiv: "adjektiv",
  Adverb: "adverb",
  Pronomen: "pronomen",
  Preposisjon: "preposisjon",
  Konjunksjon: "konjunksjon",
  Interjeksjon: "interjeksjon",
};

const genderLabels: Record<string, string> = {
  Hankjoenn: "m.",
  Hokjoenn: "f.",
  Inkjekjoenn: "n.",
  HankjoennHokjoenn: "m./f.",
};

const placeTypeLabels: Record<string, string> = {
  Kommune: "kommune",
  Landskap: "landskap",
  Fylke: "fylke",
  DelAvLandskap: "del av landskap",
  Landsdel: "landsdel",
  Tvillingkommune: "tvillingkommune",
  DelAvLandsdel: "del av landsdel",
  DelAvFylke: "del av fylke",
  Region: "region",
  Land: "land",
};

function biblLabel(ref: RichSegment["reference"]): string {
  if (!ref) {
    return "";
  }

  const sections: string[] = [];

  if (ref.author) {
    sections.push(ref.author);
  }

  if (ref.title) {
    sections.push(`\u00AB${ref.title}\u00BB`);
  }

  const loc: string[] = [];

  if (ref.year) {
    loc.push(ref.year);
  }

  if (ref.spec) {
    loc.push(ref.spec.textContent);
  }

  if (loc.length > 0) {
    sections.push(loc.join(", "));
  }

  return sections.join(". ") || ref.code;
}

function placeLabel(place: RichSegment["place"]): string {
  if (!place) {
    return "";
  }

  const name = place.name || place.code || "";
  const type = place.type ? (placeTypeLabels[place.type] ?? place.type) : "";

  return type ? `${name}, ${type}` : name;
}

function positionTooltip(tooltip: HTMLElement, anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const pad = 8;

  tooltip.style.top = `${rect.top - 4}px`;
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.transform = "translate(-50%, -100%)";

  requestAnimationFrame(() => {
    const tr = tooltip.getBoundingClientRect();

    if (tr.left < pad) {
      tooltip.style.left = `${pad + tr.width / 2}px`;
    } else if (tr.right > window.innerWidth - pad) {
      tooltip.style.left = `${window.innerWidth - pad - tr.width / 2}px`;
    }
  });
}

function buildDefTree(flatDefs: FlatDef[]) {
  const roots: {
    def: FlatDef;
    index: number;
    children: { def: FlatDef; index: number }[];
  }[] = [];
  const byIndex = new Map<number, (typeof roots)[0]>();

  for (let i = 0; i < flatDefs.length; i++) {
    const def = flatDefs[i];

    if (def.parentIndex === null) {
      const node = {
        def,
        index: i,
        children: [] as { def: FlatDef; index: number }[],
      };

      roots.push(node);
      byIndex.set(i, node);
    }
  }

  for (let i = 0; i < flatDefs.length; i++) {
    const def = flatDefs[i];

    if (def.parentIndex !== null) {
      const parent = byIndex.get(def.parentIndex);

      if (parent) parent.children.push({ def, index: i });
    }
  }

  return roots;
}

function collectCitations(
  defTree: ReturnType<typeof buildDefTree>,
): CitationRef[] {
  const seen = new Map<string, CitationRef>();

  function addFromSegments(segments: RichSegment[] | undefined) {
    for (const seg of segments ?? []) {
      if (
        seg.type === "Bibliography" &&
        seg.reference &&
        !seen.has(seg.reference.code)
      ) {
        seen.set(seg.reference.code, seg.reference);
      }
    }
  }

  for (const node of defTree.slice(0, 4)) {
    for (const c of node.def.content) {
      addFromSegments(c.richContent);
    }

    for (const ex of node.def.examples.slice(0, 2)) {
      addFromSegments(ex.richContent);
    }

    for (const child of node.children.slice(0, 3)) {
      for (const c of child.def.content) {
        addFromSegments(c.richContent);
      }

      for (const ex of child.def.examples.slice(0, 1)) {
        addFromSegments(ex.richContent);
      }
    }
  }

  return [...seen.values()];
}

function RichContent(props: { segments: RichSegment[] }): JSX.Element {
  const citationMap = useContext(CitationContext);

  return (
    <For each={props.segments}>
      {(seg) => {
        switch (seg.type) {
          case "Bibliography": {
            const num = () =>
              seg.reference ? citationMap().get(seg.reference.code) : undefined;
            const popoverId = () =>
              seg.reference ? `cite-pop-${seg.reference.code}` : undefined;

            return (
              <Show when={num()}>
                <span class={styles.citeWrap}>
                  <button
                    type="button"
                    class={styles.citeLink}
                    aria-label={`Kjelde ${num()}: ${biblLabel(seg.reference)}`}
                    data-popover-for={popoverId()}
                    onClick={(e) => {
                      const el = document.getElementById(popoverId()!);
                      if (el) {
                        positionTooltip(el, e.currentTarget);
                        el.togglePopover();
                      }
                    }}
                    onPointerEnter={(e) => {
                      if (window.matchMedia("(pointer: fine)").matches) {
                        const el = document.getElementById(popoverId()!);
                        if (el && !el.matches(":popover-open")) {
                          positionTooltip(el, e.currentTarget);
                          el.showPopover();
                        }
                      }
                    }}
                    onPointerLeave={() => {
                      const el = document.getElementById(popoverId()!);
                      if (el?.matches(":popover-open")) el.hidePopover();
                    }}
                  >
                    <sup>{num()}</sup>
                  </button>
                  <span
                    id={popoverId()}
                    popover="auto"
                    role="tooltip"
                    class={styles.citeTooltip}
                  >
                    {biblLabel(seg.reference)}
                  </span>
                </span>
              </Show>
            );
          }
          case "Place": {
            const placeName = () =>
              seg.place?.name || seg.place?.code || seg.content;
            const popoverId = () =>
              seg.place ? `place-pop-${seg.place.id}` : undefined;

            return (
              <span class={styles.citeWrap}>
                <button
                  type="button"
                  class={styles.citeLink}
                  aria-label={placeLabel(seg.place)}
                  data-popover-for={popoverId()}
                  onClick={(e) => {
                    const el = document.getElementById(popoverId()!);
                    if (el) {
                      positionTooltip(el, e.currentTarget);
                      el.togglePopover();
                    }
                  }}
                  onPointerEnter={(e) => {
                    if (window.matchMedia("(pointer: fine)").matches) {
                      const el = document.getElementById(popoverId()!);
                      if (el && !el.matches(":popover-open")) {
                        positionTooltip(el, e.currentTarget);
                        el.showPopover();
                      }
                    }
                  }}
                  onPointerLeave={() => {
                    const el = document.getElementById(popoverId()!);
                    if (el?.matches(":popover-open")) el.hidePopover();
                  }}
                >
                  <sup>({placeName()})</sup>
                </button>
                <span
                  id={popoverId()}
                  popover="auto"
                  role="tooltip"
                  class={styles.citeTooltip}
                >
                  {placeLabel(seg.place)}
                </span>
              </span>
            );
          }
          case "Superscript":
          case "Subscript":
          case "Italic":
          case "Bold":
            return <span>{seg.content}</span>;
          default:
            return <>{seg.content}</>;
        }
      }}
    </For>
  );
}

interface ArticleCardProps {
  article: Article;
  word: string;
}

export default function ArticleCard(props: ArticleCardProps) {
  const flatDefs = () => (props.article?.flatDefinitions ?? []) as FlatDef[];
  const defTree = () => buildDefTree(flatDefs());
  const citations = () => collectCitations(defTree());
  const citationMap = () => {
    const map = new Map<string, number>();

    citations().forEach((ref, idx) => map.set(ref.code, idx + 1));

    return map;
  };

  return (
    <>
      <div class={styles.cardHeader}>
        <h3 class={styles.headword}>{props.word}</h3>
        <p class={styles.meta}>
          {wordClassLabels[props.article?.wordClass ?? ""] ??
            props.article?.wordClass}
          {props.article?.gender
            ? `, ${genderLabels[props.article.gender] ?? props.article.gender}`
            : ""}
          {", "}
          {dictLabels[props.article?.dictionary ?? ""] ??
            props.article?.dictionary}
        </p>
      </div>
      <div class={styles.cardBody}>
        <CitationContext.Provider value={citationMap}>
          <ol class={styles.defList}>
            <For each={defTree().slice(0, 4)}>
              {(node) => (
                <li class={styles.defItem}>
                  <Show when={node.def.content.length > 0}>
                    <span class={styles.defText}>
                      <For each={node.def.content}>
                        {(c, ci) => (
                          <>
                            <Show when={ci() > 0}>{"; "}</Show>
                            <RichContent segments={c.richContent ?? []} />
                          </>
                        )}
                      </For>
                    </span>
                  </Show>
                  <For each={node.def.examples.slice(0, 2)}>
                    {(ex) => (
                      <p class={styles.example}>
                        <Show
                          when={ex.richContent?.length}
                          fallback={ex.textContent}
                        >
                          <RichContent segments={ex.richContent!} />
                        </Show>
                      </p>
                    )}
                  </For>
                  <Show when={node.children.length > 0}>
                    <ol class={styles.subDefList}>
                      <For each={node.children.slice(0, 3)}>
                        {(child) => (
                          <li class={styles.subDefItem}>
                            <Show when={child.def.content.length > 0}>
                              <span class={styles.defText}>
                                <For each={child.def.content}>
                                  {(c, ci) => (
                                    <>
                                      <Show when={ci() > 0}>{"; "}</Show>
                                      <RichContent
                                        segments={c.richContent ?? []}
                                      />
                                    </>
                                  )}
                                </For>
                              </span>
                            </Show>
                            <For each={child.def.examples.slice(0, 1)}>
                              {(ex) => (
                                <p class={styles.example}>
                                  <Show
                                    when={ex.richContent?.length}
                                    fallback={ex.textContent}
                                  >
                                    <RichContent segments={ex.richContent!} />
                                  </Show>
                                </p>
                              )}
                            </For>
                          </li>
                        )}
                      </For>
                      <Show when={node.children.length > 3}>
                        <li class={styles.moreIndicator}>
                          + {node.children.length - 3} til …
                        </li>
                      </Show>
                    </ol>
                  </Show>
                </li>
              )}
            </For>
            <Show when={defTree().length > 4}>
              <li class={styles.moreIndicator}>
                + {defTree().length - 4} til …
              </li>
            </Show>
          </ol>
          <Show when={citations().length > 0}>
            <footer class={styles.citationList} aria-label="Kjelder">
              <ol>
                <For each={citations()}>
                  {(ref, idx) => (
                    <li
                      id={`ref-${ref.code}`}
                      class={styles.citationItem}
                      value={idx() + 1}
                    >
                      {biblLabel(ref)}
                    </li>
                  )}
                </For>
              </ol>
            </footer>
          </Show>
        </CitationContext.Provider>
      </div>
    </>
  );
}
