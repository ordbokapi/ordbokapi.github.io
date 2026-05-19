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

import { For, onMount, onCleanup, createSignal } from "solid-js";
import type { JSX } from "solid-js";
import { NoHydration } from "solid-js/web";
import { showcaseMeta } from "virtual:showcase-data";
import { showcaseQueries } from "~/lib/queries";
import ChevronRight from "lucide-solid/icons/chevron-right";
import CodeBlock from "./CodeBlock";
import DictionaryEntry from "./DictionaryEntry";
import styles from "./ShowcaseFlow.module.css";
import resultStyles from "./ResultParts.module.css";
import graphStyles from "./WordGraph.module.css";

const isServer = import.meta.env.SSR || import.meta.env.DEV;

const ssrData = isServer ? await import("virtual:showcase-data") : null;
const ArticleCard = isServer ? (await import("./ArticleCard")).default : null;
const DialectCards = isServer ? (await import("./DialectCards")).default : null;
const EtymologySummary = isServer
  ? (await import("./EtymologySummary")).default
  : null;
const SearchResults = isServer
  ? (await import("./SearchResults")).default
  : null;
const WordGraph = isServer ? (await import("./WordGraph")).default : null;
const ArrowRight = isServer
  ? (await import("lucide-solid/icons/arrow-right")).default
  : null;
const ChevronDown = isServer
  ? (await import("lucide-solid/icons/chevron-down")).default
  : null;

interface CodeTab {
  label: string;
  code: string;
  lang?: "graphql" | "json" | "javascript";
}

function TabbedCode(props: { tabs: CodeTab[] }): JSX.Element {
  const [active, setActive] = createSignal(0);

  return (
    <div class={styles.tabbedCode}>
      <div class={styles.tabBar} role="tablist">
        <For each={props.tabs}>
          {(tab, i) => (
            <button
              type="button"
              role="tab"
              aria-selected={i() === active()}
              class={`${styles.tab} ${i() === active() ? styles.tabActive : ""}`}
              onClick={() => setActive(i())}
            >
              {tab.label}
            </button>
          )}
        </For>
      </div>
      <For each={props.tabs}>
        {(tab, i) => (
          <div
            role="tabpanel"
            class={i() !== active() ? styles.tabPanelHidden : undefined}
          >
            <CodeBlock code={tab.code} lang={tab.lang} />
          </div>
        )}
      </For>
    </div>
  );
}

function trimQuery(query: string): string {
  return query
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n")
    .trim();
}

interface ShowcaseItem {
  question: string;
  query: string;
  variables?: string;
  formattedResponse: string;
  sandboxUrl: string;
  result: () => import("solid-js").JSX.Element;
  fromRight?: boolean;
  interactive?: boolean;
  containerClass?: string;
  containerRole?: JSX.HTMLAttributes<HTMLDivElement>["role"];
  containerLabel?: string;
}

export default function ShowcaseFlow() {
  const showcases = (): ShowcaseItem[] => [
    {
      question: "Kva tyder «forstå»?",
      query: trimQuery(showcaseQueries.lookup.display),
      variables: JSON.stringify(showcaseQueries.lookup.variables, null, 2),
      formattedResponse: ssrData?.formattedResponses.lookup ?? "",
      sandboxUrl: ssrData?.sandboxUrls.lookup ?? "",
      interactive: true,
      result: () => {
        const exact = ssrData?.showcaseData.lookup?.suggestions.exact[0];
        const articles = exact?.articles ?? [];
        return (
          <DictionaryEntry
            word={showcaseMeta.lookup.word}
            labels={showcaseMeta.lookup.labels}
          >
            {isServer && ArticleCard
              ? articles.map((article) => (
                  <ArticleCard article={article} word={exact?.word ?? ""} />
                ))
              : null}
          </DictionaryEntry>
        );
      },
    },
    {
      question: "Korleis ser orda ut på bergensk?",
      query: trimQuery(showcaseQueries.dialect.display),
      variables: JSON.stringify(showcaseQueries.dialect.variables, null, 2),
      formattedResponse: ssrData?.formattedResponses.dialect ?? "",
      sandboxUrl: ssrData?.sandboxUrls.dialect ?? "",
      fromRight: true,
      containerClass: resultStyles.container,
      containerLabel: "Dialektformer frå Bergen",
      result: () =>
        DialectCards ? (
          <DialectCards data={ssrData!.showcaseData.dialect} />
        ) : null,
    },
    {
      question: "Kva substantiv kjem frå norrønt?",
      query: trimQuery(showcaseQueries.norseOrigin.display),
      formattedResponse: ssrData?.formattedResponses.norseOrigin ?? "",
      sandboxUrl: ssrData?.sandboxUrls.norseOrigin ?? "",
      containerClass: resultStyles.container,
      containerLabel: "Substantiv med norrønt opphav",
      result: () =>
        EtymologySummary ? (
          <EtymologySummary data={ssrData!.showcaseData.norseOrigin} />
        ) : null,
    },
    {
      question: "Kva franske lånord har «sj»-lyden?",
      query: trimQuery(showcaseQueries.search.display),
      variables: JSON.stringify(showcaseQueries.search.variables, null, 2),
      formattedResponse: ssrData?.formattedResponses.search ?? "",
      sandboxUrl: ssrData?.sandboxUrls.search ?? "",
      fromRight: true,
      containerClass: resultStyles.container,
      containerLabel: "Søkjeresultat: franske lånord med «sj»",
      result: () =>
        SearchResults ? (
          <SearchResults data={ssrData!.showcaseData.search} />
        ) : null,
    },
    {
      question: "Korleis heng orda saman?",
      query: trimQuery(showcaseQueries.graph.display),
      variables: JSON.stringify(showcaseQueries.graph.variables, null, 2),
      formattedResponse: ssrData?.formattedResponses.graph ?? "",
      sandboxUrl: ssrData?.sandboxUrls.graph ?? "",
      containerClass: graphStyles.container,
      containerRole: "img",
      containerLabel: "Graf over ordrelasjonar",
      result: () =>
        WordGraph ? (
          <WordGraph
            data={ssrData!.showcaseData.graph}
            centerArticleId={100431}
          />
        ) : null,
    },
  ];

  let sectionRef!: HTMLElement;

  onMount(() => {
    if (typeof IntersectionObserver === "undefined") {
      sectionRef
        .querySelectorAll(`.${styles.showcase}`)
        .forEach((el) => el.classList.add(styles.visible));
      sectionRef
        .querySelectorAll(`.${styles.resultCol}`)
        .forEach((el) => el.classList.add(styles.revealed));

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    const resultObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            resultObserver.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    sectionRef
      .querySelectorAll(`.${styles.showcase}`)
      .forEach((el) => observer.observe(el));

    sectionRef
      .querySelectorAll(`.${styles.resultCol}`)
      .forEach((el) => resultObserver.observe(el));

    onCleanup(() => {
      observer.disconnect();
      resultObserver.disconnect();
    });
  });

  return (
    <section class={styles.section} ref={sectionRef} aria-label="Brukstilfelle">
      <For each={showcases()}>
        {(item) => (
          <div
            class={`${styles.showcase} ${item.fromRight ? styles.fromRight : ""}`}
          >
            <h2 class={styles.question}>{item.question}</h2>
            <div class={styles.queryCol}>
              <TabbedCode
                tabs={[
                  { label: "Førespurnad", code: item.query, lang: "graphql" },
                  ...(item.variables
                    ? [
                        {
                          label: "Variablar",
                          code: item.variables,
                          lang: "json" as const,
                        },
                      ]
                    : []),
                ]}
              />
              <NoHydration>
                <a href={item.sandboxUrl} class={styles.tryLink}>
                  Prøv sjølv i Apollo Sandbox
                  {ArrowRight && <ArrowRight size={14} />}
                </a>
              </NoHydration>
            </div>
            {item.interactive ? (
              <div class={styles.resultCol}>{item.result()}</div>
            ) : (
              <div class={styles.resultCol}>
                <div
                  class={item.containerClass}
                  role={item.containerRole ?? "region"}
                  aria-label={item.containerLabel}
                >
                  <NoHydration>{item.result()}</NoHydration>
                </div>
              </div>
            )}
            <NoHydration>
              <details class={styles.fullData}>
                <summary class={styles.fullDataSummary}>
                  <ChevronRight size={14} class={styles.detailsIconCollapsed} />
                  {ChevronDown && (
                    <ChevronDown size={14} class={styles.detailsIconExpanded} />
                  )}
                  Vis data
                </summary>
                <div class={styles.fullDataContent}>
                  <CodeBlock code={item.formattedResponse} lang="json" />
                </div>
              </details>
            </NoHydration>
          </div>
        )}
      </For>
    </section>
  );
}
