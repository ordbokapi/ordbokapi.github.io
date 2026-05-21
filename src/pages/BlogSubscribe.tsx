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

import { createSignal, Show } from "solid-js";
import styles from "./blog-subscribe.module.css";
import ShieldCheck from "lucide-solid/icons/shield-check";
import { mailerUrl } from "../lib/mailer";

export default function BlogSubscribe() {
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `${mailerUrl}/subscribe?email=${encodeURIComponent(email)}`,
      );
      if (res.status === 200) {
        setMessage({
          text: "Takk for at du abonnerer! Sjekk e-posten din for ei stadfestingslenkje.",
          type: "success",
        });
      } else if (res.status === 429) {
        setMessage({
          text: "Du har vore for rask. Ver venleg og prøv att om ei stund.",
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
  }

  return (
    <div class={styles.page}>
      <h1>Abonner på blogg&shy;oppdateringar</h1>
      <p class={styles.lead}>
        Viss du vil abonnere på blogg&shy;oppdateringar, skriv du inn
        e-post&shy;adressa di her og trykkjer på «Abonner». Du vil få eit
        e-post&shy;varsel når nye innlegg vert publiserte.
      </p>
      <form class={styles.form} onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          aria-label="E-postadresse"
          aria-describedby="email-constraint"
          placeholder="E-postadresse"
          required
          maxLength={100}
          class={styles.input}
        />
        <p id="email-constraint" class="sr-only">
          Maks 100 teikn
        </p>
        <button type="submit" class="btn btn-primary" disabled={loading()}>
          Abonner
        </button>
      </form>
      <Show when={loading()}>
        <div class={styles.spinner} role="status" aria-label="Lastar..." />
      </Show>
      <Show when={message()}>
        {(msg) => (
          <p
            role={msg().type === "error" ? "alert" : "status"}
            class={`${styles.message} ${msg().type === "success" ? styles.success : styles.error}`}
          >
            {msg().text}
          </p>
        )}
      </Show>

      <div class={styles.divider}>
        <div class={styles.dividerLine} />
        <span class={styles.dividerIcon} aria-hidden="true">
          <ShieldCheck size={32} />
        </span>
        <div class={styles.dividerLine} />
      </div>

      <div class={styles.privacy}>
        <p>
          Du kan når som helst avslutte abonnementet ved å trykkje på
          avmeldings&shy;lenkja i e-postane du får. E-post&shy;adressa di vert
          då sletta.
        </p>
        <p>
          Les meir om korleis me handsamar data i{" "}
          <a href="/personvern/">personvern&shy;erklæringa vår</a>.
        </p>
      </div>
    </div>
  );
}
