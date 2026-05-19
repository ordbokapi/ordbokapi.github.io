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

import { Show, createSignal, createResource, Suspense } from "solid-js";
import type { JSX } from "solid-js";
import { NoHydration } from "solid-js/web";
import Copy from "lucide-solid/icons/copy";
import Check from "lucide-solid/icons/check";
import { highlight, type Language } from "~/lib/highlight";
import styles from "./CodeBlock.module.css";

interface Props {
  code: string;
  lang?: Language;
  label?: string;
}

export default function CodeBlock(props: Props): JSX.Element {
  let codeRef!: HTMLDivElement;

  const [html] = createResource(
    () => (props.lang ? { code: props.code, lang: props.lang } : undefined),
    (src) => highlight(src.code, src.lang),
  );

  const [copied, setCopied] = createSignal(false);

  function copyCode() {
    const text = codeRef.querySelector("code")?.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      {props.label && <span class={styles.label}>{props.label}</span>}
      <div class={styles.codeWrapper} ref={codeRef}>
        <button
          type="button"
          class={styles.copyButton}
          aria-label={copied() ? "Kopiert" : "Kopier kode"}
          onClick={copyCode}
        >
          <Show when={copied()} fallback={<Copy size={16} />}>
            <Check size={16} />
          </Show>
        </button>
        <NoHydration>
          <Suspense
            fallback={
              <pre class={styles.codeBlock} tabIndex={0}>
                <code>{props.code}</code>
              </pre>
            }
          >
            <Show
              when={html()}
              fallback={
                <pre class={styles.codeBlock} tabIndex={0}>
                  <code>{props.code}</code>
                </pre>
              }
            >
              {(highlighted) => (
                <div class={styles.highlighted} innerHTML={highlighted()} />
              )}
            </Show>
          </Suspense>
        </NoHydration>
      </div>
    </div>
  );
}
