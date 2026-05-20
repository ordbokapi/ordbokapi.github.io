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

import { createSignal, onMount, Show } from "solid-js";
import styles from "./blog-verify.module.css";
import { mailerUrl } from "../lib/mailer";

export default function BlogVerify() {
  const [loading, setLoading] = createSignal(true);
  const [message, setMessage] = createSignal<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  onMount(async () => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      setLoading(false);
      setMessage({
        text: "Stadfestingslenkja er ugyldig.",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch(
        `${mailerUrl}/verify?token=${encodeURIComponent(token)}`,
      );

      if (res.status === 200) {
        setMessage({
          text: "Abonnementet ditt er stadfesta. Du vil mottaka ein e-post når nye innlegg vert publiserte.",
          type: "success",
        });
      } else if (res.status === 429) {
        setMessage({
          text: "Du har vore for rask. Ver venleg og prøv att om ei stund.",
          type: "error",
        });
      } else if (res.status === 404) {
        setMessage({
          text: "Stadfestingslenkja er ugyldig. Har du allereie stadfesta abonnementet ditt?",
          type: "error",
        });
      } else {
        setMessage({
          text: "Noko gjekk gale. Ver venleg og prøv att.",
          type: "error",
        });
      }
    } catch {
      setMessage({
        text: "Noko gjekk gale. Ver venleg og prøv att.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class={styles.page}>
      <h1>Stadfest abonnement</h1>
      <Show when={loading()}>
        <div class={styles.spinner} role="status" aria-label="Lastar..." />
      </Show>
      <Show when={message()}>
        {(msg) => (
          <p
            class={`${styles.message} ${msg().type === "success" ? styles.success : styles.error}`}
          >
            {msg().text}
          </p>
        )}
      </Show>
    </div>
  );
}
