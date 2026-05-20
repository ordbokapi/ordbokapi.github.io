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
          Bruk av API-et krev ikkje registrering, og me lagrar ikkje
          brukar&shy;kontoar. Me samlar berre inn det minimum av data som er
          naudsynt for å drifte tenesta trygt:
        </p>
        <ul>
          <li>
            <strong>IP-adresser og førespurnads&shy;data</strong> vert
            mellombels logga når du brukar API-et, for å overvaka tenesta og
            hindre misbruk.
          </li>
          <li>
            <strong>E-post&shy;adressa di</strong> vert lagra berre dersom du
            sjølv vel å abonnere på blogg&shy;oppdateringar om API-et.
          </li>
        </ul>
        <p>
          Utover dette samlar me ikkje inn person&shy;opplysningar. Me sel ikkje
          data til tredjepartar, og me brukar ikkje dataa til
          marknads&shy;føring eller profilering.
        </p>

        <h3>Tenesteloggar</h3>
        <p>
          Når du sender førespurnader til API-et, loggar tenaren IP-adressa di
          saman med teknisk førespurnads&shy;data, til dømes tidspunkt,
          endepunkt og status&shy;kode. Dette skjer for alle som brukar API-et,
          og er naudsynt for å overvaka tenesta og hindre misbruk. Behandlinga
          skjer med grunnlag i legitim interesse, jf.{" "}
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

        <h3>E-postabonnement for blogg&shy;oppdateringar</h3>
        <p>
          E-post&shy;abonnementet er heilt friviljug og skilt frå sjølve
          API-bruken. Du treng ikkje abonnere for å bruke API-et.
        </p>
        <p>
          Dersom du vel å abonnere, lagrar me e-post&shy;adressa di for å sende
          deg varsel om nye innlegg. Behandlinga skjer med grunnlag i samtykke,
          jf.{" "}
          <a href="https://lovdata.no/lov/2018-06-15-38/gdpr/a6">
            GDPR artikkel 6(1)(a)
          </a>
          . Du kan når som helst{" "}
          <a href="/blogg/avslutt/">avslutte abonnementet</a>, og
          e-post&shy;adressa di vert då sletta.
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
          <li>
            <strong>Proton Mail</strong>: E-post for blogg&shy;abonnement vert
            sendt via Proton Mail. Sjå{" "}
            <a href="https://proton.me/legal/privacy">
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
        <p>
          For e-post&shy;abonnement kan du avslutte abonnementet når som helst
          ved å trykkje på avmeldings&shy;lenkja i e-postane du får.
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
