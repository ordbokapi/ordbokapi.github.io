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

import { For, Show, createSignal, onMount } from "solid-js";
import type { JSX } from "solid-js";
import { NoHydration } from "solid-js/web";
import ChevronLeft from "lucide-solid/icons/chevron-left";
import ChevronRight from "lucide-solid/icons/chevron-right";
import styles from "./DictionaryEntry.module.css";

if (typeof document !== "undefined") {
  document.addEventListener(
    "scroll",
    () => {
      const open = document.querySelector(
        "[popover]:popover-open",
      ) as HTMLElement | null;
      open?.hidePopover();
    },
    { capture: true },
  );
}

function positionPopover(popover: HTMLElement, anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const pad = 8;

  popover.style.top = `${rect.top - 4}px`;
  popover.style.left = `${rect.left + rect.width / 2}px`;
  popover.style.transform = "translate(-50%, -100%)";

  requestAnimationFrame(() => {
    const rect = popover.getBoundingClientRect();

    if (rect.left < pad) {
      popover.style.left = `${pad + rect.width / 2}px`;
    } else if (rect.right > window.innerWidth - pad) {
      popover.style.left = `${window.innerWidth - pad - rect.width / 2}px`;
    }
  });
}

function setupPopoverDelegation(root: HTMLElement) {
  root.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest(
      "[data-popover-for]",
    ) as HTMLElement | null;

    if (!btn) {
      return;
    }

    const id = btn.dataset.popoverFor;

    if (!id) {
      return;
    }

    const el = document.getElementById(id);

    if (!el) {
      return;
    }

    positionPopover(el, btn);
    el.togglePopover();
  });

  root.addEventListener(
    "pointerenter",
    (e) => {
      if (!window.matchMedia("(pointer: fine)").matches) {
        return;
      }

      const btn = (e.target as HTMLElement).closest(
        "[data-popover-for]",
      ) as HTMLElement | null;

      if (!btn) {
        return;
      }

      const id = btn.dataset.popoverFor;

      if (!id) {
        return;
      }

      const el = document.getElementById(id);

      if (el && !el.matches(":popover-open")) {
        positionPopover(el, btn);
        el.showPopover();
      }
    },
    true,
  );

  root.addEventListener(
    "pointerleave",
    (e) => {
      const btn = (e.target as HTMLElement).closest(
        "[data-popover-for]",
      ) as HTMLElement | null;

      if (!btn) {
        return;
      }

      const id = btn.dataset.popoverFor;

      if (!id) {
        return;
      }

      const el = document.getElementById(id);

      if (el?.matches(":popover-open")) {
        el.hidePopover();
      }
    },
    true,
  );
}

function getShellPosition(
  i: number,
  active: number,
  count: number,
): "front" | "behind1" | "behind2" | "hidden" {
  if (i === active) {
    return "front";
  }

  const dist = (i - active + count) % count;

  if (dist === 1) {
    return "behind1";
  }

  if (dist === count - 1 && count > 2) {
    return "behind2";
  }

  return "hidden";
}

const shellPosClass = {
  front: styles.shellFront,
  behind1: styles.shellBehind1,
  behind2: styles.shellBehind2,
  hidden: styles.shellHidden,
};

interface Props {
  word: string;
  labels: string[];
  children?: JSX.Element;
}

export default function DictionaryEntry(props: Props) {
  const count = () => props.labels.length;

  const [active, setActive] = createSignal(0);
  const [displayed, setDisplayed] = createSignal(0);
  const [target, setTarget] = createSignal(0);
  const [showCard, setShowCard] = createSignal(true);

  let settleTimer: number | undefined;
  const cardRefs: HTMLDivElement[] = [];

  function go(to: number) {
    if (count() <= 1) {
      return;
    }

    if (to === target()) {
      return;
    }

    const dist = (to - active() + count()) % count();
    const dir = dist <= count() / 2 ? "forward" : "backward";
    setTarget(to);
    setActive(to);

    const currentRef = cardRefs[displayed()];
    if (currentRef) {
      const clone = currentRef.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.classList.remove(styles.cardEnter);
      clone.classList.add(
        dir === "forward" ? styles.cardExit : styles.cardExitBack,
      );
      clone.addEventListener("animationend", () => clone.remove());
      currentRef.parentElement!.appendChild(clone);
    }
    setShowCard(false);

    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      setDisplayed(target());
      setShowCard(true);
    }, 300);
  }

  function next() {
    go((active() + 1) % count());
  }
  function prev() {
    go((active() - 1 + count()) % count());
  }

  function handleTabKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();

      if (e.key === "ArrowLeft") {
        prev();
      } else {
        next();
      }

      queueMicrotask(() => {
        document.getElementById(tabId(active()))?.focus();
      });
    }
  }

  const tabId = (i: number) => `dict-tab-${i}`;
  const panelId = (i: number) => `dict-panel-${i}`;

  let stackRef!: HTMLDivElement;
  onMount(() => setupPopoverDelegation(stackRef));

  return (
    <div
      ref={stackRef}
      class={styles.stack}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Ordbok-oppslag for ${props.word}`}
    >
      <div class={styles.deck} aria-live="polite" aria-atomic="false">
        <For each={props.labels}>
          {(_, i) => (
            <div
              class={`${styles.shell} ${shellPosClass[getShellPosition(i(), active(), count())]}`}
            />
          )}
        </For>

        <For each={props.labels}>
          {(_, i) => (
            <div
              ref={(el) => {
                cardRefs[i()] = el;
              }}
              id={panelId(i())}
              role="tabpanel"
              aria-roledescription="slide"
              aria-labelledby={tabId(i())}
              inert={i() !== displayed() || undefined}
              class={`${styles.card} ${
                i() === displayed()
                  ? showCard()
                    ? styles.cardEnter
                    : styles.cardHidden
                  : styles.cardHidden
              }`}
            >
              <NoHydration>
                {(() => {
                  const children = props.children;

                  if (children == null) {
                    return undefined;
                  }

                  return Array.isArray(children)
                    ? children[i()]
                    : i() === 0
                      ? children
                      : undefined;
                })()}
              </NoHydration>
            </div>
          )}
        </For>
      </div>

      <Show when={count() > 1}>
        <nav class={styles.nav} aria-label="Bla mellom ordbøker">
          <button
            class={styles.navBtn}
            onClick={prev}
            aria-label="Førre ordbok"
          >
            <ChevronLeft size={18} />
          </button>
          <div
            class={styles.dots}
            role="tablist"
            aria-label="Ordbøker"
            onKeyDown={handleTabKeyDown}
          >
            <For each={props.labels}>
              {(label, i) => (
                <button
                  id={tabId(i())}
                  class={`${styles.dot} ${
                    i() === active() ? styles.dotActive : ""
                  }`}
                  role="tab"
                  aria-selected={i() === active()}
                  aria-controls={panelId(i())}
                  aria-label={label}
                  onClick={() => go(i())}
                  tabIndex={i() === active() ? 0 : -1}
                />
              )}
            </For>
          </div>
          <button
            class={styles.navBtn}
            onClick={next}
            aria-label="Neste ordbok"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      </Show>
    </div>
  );
}
