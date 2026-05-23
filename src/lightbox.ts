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

import "./lightbox.css";

const pointers = new Map<number, PointerEvent>();
let dialog: HTMLDialogElement | null = null;
let state = { scale: 1, tx: 0, ty: 0 };
let lastPinchDist = 0;
let lastPanX = 0;
let lastPanY = 0;
let zoomTarget: HTMLElement | null = null;
let didDrag = false;

function clampTranslate() {
  if (!zoomTarget) {
    return;
  }

  const rect = zoomTarget.getBoundingClientRect();
  const parent = zoomTarget.parentElement!.getBoundingClientRect();

  const overflowX = Math.max(0, (rect.width - parent.width) / 2);
  const overflowY = Math.max(0, (rect.height - parent.height) / 2);

  state.tx = Math.max(-overflowX, Math.min(overflowX, state.tx));
  state.ty = Math.max(-overflowY, Math.min(overflowY, state.ty));
}

function applyTransform() {
  if (!zoomTarget) {
    return;
  }

  zoomTarget.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
  zoomTarget.parentElement!.classList.toggle("zoomed", state.scale > 1);
}

function resetTransform() {
  state = { scale: 1, tx: 0, ty: 0 };
  if (zoomTarget) {
    zoomTarget.style.transform = "";
    zoomTarget.parentElement!.classList.remove("zoomed", "dragging");
  }
}

function pinchDistance(a: PointerEvent, b: PointerEvent) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function onPointerDown(e: PointerEvent) {
  const body = dialog?.querySelector<HTMLElement>(".lightbox-body");

  if (!body) {
    return;
  }

  body.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, e);
  didDrag = false;

  if (pointers.size === 2) {
    const [a, b] = pointers.values();

    lastPinchDist = pinchDistance(a, b);
  } else if (pointers.size === 1) {
    lastPanX = e.clientX;
    lastPanY = e.clientY;

    if (state.scale > 1) {
      body.classList.add("dragging");
    }
  }
}

function onPointerMove(e: PointerEvent) {
  if (!pointers.has(e.pointerId)) {
    return;
  }

  pointers.set(e.pointerId, e);

  if (pointers.size === 2) {
    const [a, b] = pointers.values();
    const dist = pinchDistance(a, b);

    if (lastPinchDist > 0) {
      const delta = dist / lastPinchDist;

      state.scale = Math.max(1, Math.min(5, state.scale * delta));

      clampTranslate();
      applyTransform();

      didDrag = true;
    }
    lastPinchDist = dist;
  } else if (pointers.size === 1 && state.scale > 1) {
    const dx = e.clientX - lastPanX;
    const dy = e.clientY - lastPanY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      didDrag = true;
    }

    state.tx += dx;
    state.ty += dy;

    clampTranslate();
    applyTransform();

    lastPanX = e.clientX;
    lastPanY = e.clientY;
  }
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId);

  if (pointers.size < 2) {
    lastPinchDist = 0;
  }

  if (pointers.size === 1) {
    const [remaining] = pointers.values();

    lastPanX = remaining.clientX;
    lastPanY = remaining.clientY;
  }

  if (pointers.size === 0) {
    dialog?.querySelector(".lightbox-body")?.classList.remove("dragging");
  }
}

let lastTap = 0;

function onDoubleTap(e: PointerEvent) {
  if (pointers.size > 1) {
    return;
  }

  const now = Date.now();

  if (now - lastTap < 300) {
    e.preventDefault();
    if (state.scale > 1) {
      resetTransform();
    } else {
      state.scale = 2;
      if (zoomTarget) {
        const rect = zoomTarget.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        state.tx = (cx - e.clientX) * (state.scale - 1);
        state.ty = (cy - e.clientY) * (state.scale - 1);

        clampTranslate();
      }
      applyTransform();
    }
  }
  lastTap = now;
}

function getDialog(): HTMLDialogElement {
  if (dialog) {
    return dialog;
  }

  dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Biletevising");
  dialog.innerHTML =
    '<button class="lightbox-close" aria-label="Lukk">\u00d7</button>' +
    '<div class="lightbox-body"></div>';

  const close = dialog.querySelector<HTMLElement>(".lightbox-close")!;
  const body = dialog.querySelector<HTMLElement>(".lightbox-body")!;

  close.addEventListener("click", () => dialog!.close());

  body.addEventListener("click", (e) => {
    if (didDrag) {
      return;
    }

    if (e.target === body) {
      if (state.scale > 1) {
        resetTransform();
      } else {
        dialog!.close();
      }
    }
  });

  body.addEventListener("pointerdown", onPointerDown);
  body.addEventListener("pointermove", onPointerMove);
  body.addEventListener("pointerup", onPointerUp);
  body.addEventListener("pointercancel", onPointerUp);
  body.addEventListener("pointerdown", onDoubleTap);

  body.addEventListener(
    "touchmove",
    (e) => {
      if (pointers.size >= 2 || state.scale > 1) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  body.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      const factor = e.deltaY > 0 ? 0.9 : 1.1;

      state.scale = Math.max(1, Math.min(5, state.scale * factor));

      if (state.scale <= 1) {
        state.tx = 0;
        state.ty = 0;
      } else {
        clampTranslate();
      }

      applyTransform();
    },
    { passive: false },
  );

  dialog.addEventListener("close", () => {
    resetTransform();

    const body = dialog!.querySelector(".lightbox-body")!;

    body.innerHTML = "";
    zoomTarget = null;

    const caption = dialog!.querySelector(".lightbox-caption");

    caption?.remove();
    pointers.clear();
  });

  document.body.appendChild(dialog);
  return dialog;
}

function openLightbox(content: HTMLElement, caption?: string) {
  const d = getDialog();
  const body = d.querySelector<HTMLElement>(".lightbox-body")!;

  body.innerHTML = "";
  body.appendChild(content);
  zoomTarget = content;

  if (caption) {
    const cap = document.createElement("div");

    cap.className = "lightbox-caption";
    cap.id = "lightbox-caption";
    cap.textContent = caption;
    body.appendChild(cap);
    content.setAttribute("aria-describedby", "lightbox-caption");
  }

  resetTransform();
  d.showModal();
}

function activateElement(el: HTMLElement) {
  const figure = el.closest("figure");
  const caption = figure?.querySelector("figcaption")?.textContent?.trim();

  if (el.tagName === "IMG") {
    const img = document.createElement("img");

    img.src = (el as HTMLImageElement).src;
    img.alt = (el as HTMLImageElement).alt || "";
    img.draggable = false;
    img.className = "lightbox-content";

    openLightbox(img, caption || undefined);
  } else {
    const svg = el.querySelector("svg");

    if (svg) {
      const clone = svg.cloneNode(true) as SVGElement;

      clone.setAttribute("preserveAspectRatio", "xMidYMid meet");

      if (!clone.hasAttribute("width") || !clone.hasAttribute("height")) {
        const viewBox = clone.getAttribute("viewBox");

        if (viewBox) {
          const [, , width, height] = viewBox.split(/\s+/);
          clone.setAttribute("width", width);
          clone.setAttribute("height", height);
        }
      }

      const wrapper = document.createElement("div");

      wrapper.className = "lightbox-content lightbox-svg";
      wrapper.appendChild(clone);

      openLightbox(wrapper, caption || undefined);
    }
  }
}

export function setupLightbox(container: HTMLElement) {
  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const zoomable = target.closest(".zoomable") as HTMLElement | null;

    if (!zoomable || zoomable.closest(".lightbox-body")) {
      return;
    }

    activateElement(zoomable);
  });

  container.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }

    const target = e.target as HTMLElement;

    if (!target.classList.contains("zoomable")) {
      return;
    }

    e.preventDefault();
    activateElement(target);
  });

  const zoomables = container.querySelectorAll<HTMLElement>(".zoomable");

  for (const el of zoomables) {
    el.style.cursor = "zoom-in";

    if (!el.hasAttribute("tabindex")) {
      el.setAttribute("tabindex", "0");
    }

    if (!el.hasAttribute("role")) {
      el.setAttribute("role", "button");
    }

    if (!el.getAttribute("aria-label")) {
      const alt = el.tagName === "IMG" ? (el as HTMLImageElement).alt : "";

      el.setAttribute(
        "aria-label",
        (alt || "Bilete") + " — trykk for å opna i fullskjerm",
      );
    }
  }
}
