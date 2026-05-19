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

import styles from "./personvern.module.css";

export default function Personvern() {
  return (
    <>
      <div class={styles.page}>
        <h1>Personvern</h1>
        <p class={styles.updated}>Sist oppdatert: 20 mai 2026</p>

        <h2>Kva data samlar me inn?</h2>
        <p>
          Ordbok API samlar ikkje inn person&shy;opplysningar. Me lagrar ikkje
          brukar&shy;kontoar, e-post&shy;adresser eller annan identifiserande
          informasjon.
        </p>

        <h3>Tenesteloggar</h3>
        <p>
          API-tenaren loggar IP-adresser og førespurnads&shy;data for å overvaka
          tenesta og hindre misbruk. Behandling av data i teneste&shy;loggar
          skjer med grunnlag i legitim interesse for tryggleik og hindring av
          misbruk, jf.{" "}
          <a href="https://lovdata.no/lov/2018-06-15-38/gdpr/a6">
            GDPR artikkel 6(1)(f)
          </a>
          .
        </p>
        <p>
          Me lagrar ikkje desse dataa på ubestemd tid. Logg&shy;filene er
          avgrensa i storleik og vert automatisk over&shy;skrivne når dei når
          grensa. Det finst difor ikkje ein fast lagrings&shy;periode; kor lenge
          data vert lagra avheng av kor mykje tenesta vert bruka. Likevel
          avgrensar dette kor lang tid data kan ligge på tenaren.
        </p>

        <h3>Informasjonskapslar</h3>
        <p>
          Denne nett&shy;staden nyttar ingen informasjons&shy;kapslar.
          Cloudflare kan setja tekniske informasjons&shy;kapslar for
          tryggleiks&shy;formål.
        </p>

        <h2>Tredjepartstenester</h2>
        <p>Denne nettstaden lastar inn ressursar frå:</p>
        <ul>
          <li>
            <strong>Cloudflare</strong>: API-et og denne nettstaden nyttar
            Cloudflare som proxy for tryggleik og ytings&shy;optimalisering.
            Cloudflare kan lagre teknisk informasjon i samsvar med{" "}
            <a href="https://www.cloudflare.com/privacypolicy/">
              personvern&shy;erklæringa deira
            </a>
            .
          </li>
          <li>
            <strong>Apollo GraphQL</strong>: GraphQL-utforskaren som me brukar,
            Apollo Sandbox, lastar inn innhald frå Apollo GraphQL og kan
            overføre data til dei i samsvar med{" "}
            <a href="https://www.apollographql.com/privacy-policy">
              personvern&shy;erklæringa deira
            </a>
            .
          </li>
        </ul>

        <h2>Rettane dine</h2>
        <p>
          Du har rett til å bede om innsyn i, retting av eller sletting av data
          me har om deg. Sidan loggdata vert automatisk overskrive, kan det
          hende at dataa alt er sletta når du tek kontakt.
        </p>

        <h2>Kontakt</h2>
        <p>
          Adaline Simonian er behandlings&shy;ansvarleg for denne tenesta. For
          spørsmål om personvern, tak kontakt via{" "}
          <a href="https://github.com/ordbokapi/api">GitHub</a>.
        </p>
      </div>
    </>
  );
}
