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

import { onMount, onCleanup } from "solid-js";
import styles from "./Hero.module.css";

export default function Hero() {
  let videoRef!: HTMLVideoElement;

  onMount(() => {
    let wasPlaying = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.play();
        } else {
          videoRef.pause();
        }
      },
      { threshold: 0 },
    );

    observer.observe(videoRef);

    const handleVisibility = () => {
      if (document.hidden) {
        wasPlaying = !videoRef.paused;
        if (wasPlaying) videoRef.pause();
      } else {
        if (wasPlaying) videoRef.play();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    onCleanup(() => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    });
  });

  return (
    <section class={styles.hero} data-theme="dark">
      <video
        ref={videoRef}
        class={styles.videoBg}
        autoplay
        muted
        loop
        playsinline
        preload="none"
        poster="/images/hero-poster.jpg"
        tabIndex={-1}
        aria-hidden="true"
      >
        <source src="/images/hero-loop.webm" type="video/webm" />
        <source src="/images/hero-loop.mp4" type="video/mp4" />
      </video>
      <div class={styles.overlay} />
      <div class={styles.content}>
        <h1 class={styles.title}>
          Tre norske ordbøker. <span class={styles.highlight}>Eitt API.</span>
        </h1>
        <p class={styles.subtitle}>
          Gratis og ope GraphQL-API til Bokmålsordboka, Nynorskordboka og Norsk
          Ordbok, for alle som vil utforske, byggje med, eller forske på det
          norske språket.
        </p>
        <div class={styles.buttons}>
          <a href="https://api.ordbokapi.org/graphql" class="btn btn-primary">
            Prøv API-et
          </a>
          <a href="https://github.com/ordbokapi/api" class="btn btn-secondary">
            Sjå på GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
