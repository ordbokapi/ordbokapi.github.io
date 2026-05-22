<!--
SPDX-FileCopyrightText: Copyright (C) 2026 Adaline Simonian
SPDX-License-Identifier: CC-BY-SA-4.0
-->

---

title: "Ny arkitektur, nye moglegheiter"
date: 2026-05-22 19:04:37 +0200
author: asimonian
categories: nyheiter
image: post-image.jpg
summary: "Ordbok API har fått ein ny arkitektur med PostgreSQL og Meilisearch som erstattar Redis. No kan ein filtrere på ordklasse, etymologi, heimfesting og bibliografi, og kombinere filtera fritt."

---

> [!IMPORTANT]
> Med desse endringane kjem somme utfasingar i skjemaet, med brytande endringar som kjem tidlegast **1. august 2026**. Sjå [nedanfor](#utfasingar) for detaljar.

Det har gått over to år sidan eg skreiv det fyrste innlegget på denne bloggen. Veg&shy;kartet eg la ut den gongen såg heilt annleis ut enn det som faktisk skjedde, både i omfang og rekkje&shy;fylgje.

I august 2025 flytta eg frå Seattle til Bergen. Det tok tid å finne meg til rette med ny jobb og ny kvardag, og utviklinga av Ordbok API låg stille ei stund.

No har det fått ein ny arkitektur og mykje ny funksjonalitet.

[[toc]]

## Problemet med den gamle arkitekturen

I utgangs&shy;punktet var Ordbok API lite meir enn eit tynt lag over UiB sitt API. Me stødde berre dei same førespurnadene som API-et deira stødde, men viste dataa i eit format som var lettare å jobbe med for dei fleste. Då vart kvar førespurnad mot vårt API ein førespurnad mot UiB sitt API.

Etter kvart introduserte me ein arbeidar&shy;prosess som synkroniserte data frå UiB med ein Redis-database som me drifta sjølv. Då vart det plutseleg mogleg for oss å stø endå meir funksjonalitet, som til dømes å vise relasjonar mellom artiklar. Sidan me no drifta søket sjølv, vart ytinga mykje betre, då nettverk&shy;trafikken unngjekk å måtta gå att og fram mellom tenesta vår og UiB for kvart enkelt søk.

Men problemet med Redis var at det held alt i minnet. Alle tre ordbøkene tok rundt 10 GB RAM saman med data og indeksar, sidan Redis-instansen måtte vera stor nok til å halde heile data&shy;settet, alle artiklar og alle indeksar, i minnet samstundes. Det er dyrt å køyre, særleg då eg betalar for alt sjølv som ein enkel&shy;person. Det avgrensa kva eg kunne gjera med prosjektet. Til dømes vart det umogleg for meg å drifte eit staging-miljø, då det ville doble kostnadene, som alt var høge.

I tillegg, sjølv om Redis stør fritekst&shy;søk og indeksering med RedisSearch, var grense&shy;snittet likevel ikkje optimalt for dei komplekse søka og filtreringa eg ville at API-et skulle stø. Det kravde òg ein god del tilpassings&shy;arbeid for å få det til å verke med rådata frå UiB. Då vart det slik at kvar ny funksjon eg ville byggje, kravde mykje av meg for å få det til.

So det var to problem i eitt: det kosta for mykje å køyre, og det var tids&shy;krevjande å byggje nye funksjonar.

Frå eit brukar&shy;synspunkt var avgrensinga enkel å kjenne på. Det gamle API-et lét ein gjera tre ting:

1. **Slå opp eit ord**: skriv inn «fjell», få attende artiklane som matchar.
2. **Hente ein artikkel etter ID**: viss du visste IDen frå før.
3. **Få forslag**: autofullfør frå det du skriv.

Det var det. Ein kunne ikkje filtrere, bla gjennom resultat eller søkje i definisjonar og dialekt&shy;former. Ein førespurnad som t.d. «gjev meg alle substantiv med dokumenterte former i Hardanger som er lånte frå lågtysk» var ikkje mogleg. Viss ein trong meir enn enkle oppslag, måtte ein gjera jobben sjølv, hente artikkel for artikkel og filtrere lokalt.

## Eit nytt fundament

Den nye arkitekturen ser slik ut:

```d2 title="Korleis Ordbok API fungerer no."
direction: down

uib: UiB {
  bokmål: Bokmålsordboka
  nynorsk: Nynorskordboka
  norsk: Norsk Ordbok
}

valkey: Valkey

worker: Arbeidarprosess {
  shape: hexagon
}

pg: PostgreSQL
meili: Meilisearch
api: GraphQL API

uib -> worker: artikkeldata
worker -> valkey: jobbkøar (med Apalis)
valkey -> worker
worker -> pg: lagrar fullstendige artiklar
worker -> meili: byggjer søkjeindeksar
pg -> api
meili -> api
```

Arbeidar&shy;prosessen hentar framleis artikkel&shy;data frå UiB, men i staden for å leggje alt i Redis, gjer han no to ting med det. Dei fullstendige artiklane vert lagra i [PostgreSQL][postgresql] som JSONB, og samstundes byggjer han denormaliserte søkje&shy;dokument i [Meilisearch][meilisearch], ein søkje&shy;motor som er laga nett for denne typen arbeid.

Me brukar framleis ein Redis-kompatibel database for jobbkøar og intern tilstand i arbeidar&shy;prosessen, men no er det [Valkey][valkey], den opne forgreininga av Redis. Jobbane vert handsama med [Apalis][apalis]. Valkey held berre køane, ikkje sjølve ordbok&shy;dataa, so minne&shy;bruken er no minimal.

## Kva ein kan gjera no som ein ikkje kunne før

Meilisearch er mykje meir fleksibel og kraftig enn RedisSearch, og det vert no enkelt å byggje avanserte søk og filtrering direkte i API-et. GraphQL-førespurnadene vert kompilerte til Meilisearch-søk som køyrer lynraskt mot indeksane.

Då vert det no mogleg å svara på spørsmål ved API-et som ikkje var mogleg før, som til dømes:

### «Kva ord er heimfesta i Hardanger?»

Viss du forskar på ord&shy;tilfanget i ein bestemd region, kan du no søkje direkte:

<!--prettier-ignore-->
```graphql sandbox
query {
  articles(
    dictionaries: [NorskOrdbok]
    filter: {
      attestationPlace: {
        name: { eq: "Hardanger" }
      }
    }
  ) {
    totalCount
    edges {
      node {
        lemmas { lemma }
        flatDefinitions {
          content { textContent }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
```

Denne førespurnaden gjev deg alle artiklar som har heim&shy;festingar i Hardanger, med paginering slik at du kan bla gjennom resultata. Pagineringa fylgjer [Relay Cursor Connections][relay-connections]-spesifikasjonen, so ho fungerer utan vidare med klientar som stør Relay-paginering.

### «Kva substantiv kjem frå lågtysk?»

For dei som er interesserte i språk&shy;historie og etymologi:

<!--prettier-ignore-->
```graphql sandbox
query {
  articles(
    dictionaries: [Nynorskordboka]
    filter: {
      wordClass: { in: [Substantiv] }
      etymologyLanguage: { in: [Laagtysk] }
    }
  ) {
    edges {
      node {
        lemmas { lemma }
        etymology { textContent }
      }
    }
    facets {
      wordClass { value count }
      etymologyLanguage { value count }
    }
  }
}
```

Saman med søkje&shy;resultata kjem fasettar, som er oppteljingar av kor mange treff det finst for kvar verdi av eit felt. Desse tala kjem direkte frå Meilisearch, som held oppteljingar i sanntid for kvart søk. Desse kan finnast i `facets`-feltet i svaret.

### «Kva ordformer er dokumenterte i Aasen sitt verk?»

Norsk Ordbok har eit rikt bibliografisk apparat. No kan du søkje i det:

<!--prettier-ignore-->
```graphql sandbox
query {
  articles(
    dictionaries: [NorskOrdbok]
    filter: {
      writtenFormSource: {
        author: { contains: "Aasen, Ivar" }
      }
    }
  ) {
    totalCount
    edges {
      node {
        lemmas { lemma }
        writtenForm {
          variants {
            writtenForm
            sources { title author }
          }
        }
      }
    }
  }
}
```

Og du kan filtrere artiklar etter kva kjelder dei refererer til. Det er nyttig dersom du forskar på korleis eit bestemt verk har påverka dokumentasjonen av norsk ordtilfang.

Filtera kan kombinerast fritt med `and`, `or` og `not`, slik at ein kan uttrykkje komplekse spørsmål i ein einaste førespurnad, til dømes «substantiv frå lågtysk som ikkje er heim&shy;festa i Trøndelag».

## Open kjeldekode under AGPL 3.0

Den nye versjonen av prosjektet er no lisensiert under [AGPL 3.0][agpl].

Tidlegare var koden under [ISC][isc], ein svært permissiv lisens som lét ein gjera nesten kva som helst med koden utan vilkår. Men eg vil sikre at forbetringar kjem attende til fellesskapet, i staden for å forsvinne inn i proprietære system.

Difor har eg valt å byte til AGPL. Med AGPL må ein gjera endringane tilgjengelege under same lisens dersom ein tek koden, endrar han og køyrer han som ei teneste. Dette sikrar at forbetringar kjem attende til felles&shy;skapet, i staden for å forsvinne inn i proprietære system.

For folk som berre brukar API-et er dette uvesentleg. Denne endringa påverkar berre dei som ville køyre sin eigen modifiserte versjon av teneste&shy;koden.

I tillegg fylgjer no alle kode&shy;lagera [REUSE][reuse]-standarden, som gjer det eksplisitt og maskin&shy;lesbert kva lisens som gjeld for kvar einskild fil.

Sjølve dataa som vert returnerte av API-et, er framleis lisensierte av UiB, ikkje dette prosjektet, og er under&shy;lagde [UiB sine vilkår][uib-lisens].

## Utfasingar

Med den nye arkitekturen kjem somme endringar i skjemaet. Tre felt vert erstatta av nye felt med betre namn og struktur.

Dei gamle felta fungerer framleis som før, men vil fjernast tidlegast **1. august 2026**. Migrer til dei nye felta før den tida.

- [`Article.definitions` og `Definition.subDefinitions` vert erstatta av `Article.flatDefinitions`](#articledefinitions-vert-articleflatdefinitions), som gjev ei flat liste av definisjonar med nivå&shy;informasjon.
- [`Lemma.meaning` vert `Lemma.homographNumber`](#lemmameaning-vert-lemmahomographnumber), som er eit meir presist namn for det det faktisk representerer.

### `Article.definitions` vert `Article.flatDefinitions`

Tidlegare var definisjonane i ein artikkel, representerte som eit rekursivt tre. Kvar `Definition` hadde eit `subDefinitions`-felt som att inneheldt eit `Definition`-objekt.

I GraphQL er slike rekursive strukturar tungvindte å jobbe med, særleg då det [ikkje finst ein rein måte å uttrykkje rekursjon på i førespurnader](https://github.com/graphql/graphql-spec/issues/929).

Då måtte brukarar skrive komplekse og uleselege førespurnader, til dømes:

<!--prettier-ignore-->
```graphql
fragment DefinitionContent on Definition {
  content { textContent }
  examples { textContent }
}

query WordDefinitions(
  $word: String!
  $dictionaries: [Dictionary!]
  $wordClass: WordClass
) {
  word(
    word: $word
    dictionaries: $dictionaries
    wordClass: $wordClass
  ) {
    articles {
      id
      dictionary
      lemmas { lemma }
      gender
      wordClass
      definitions {
        ...DefinitionContent
        subDefinitions {
          ...DefinitionContent
          subDefinitions {
            ...DefinitionContent
            subDefinitions {
              ...DefinitionContent
              subDefinitions {
                ...DefinitionContent
                subDefinitions {
                  ...DefinitionContent
                  subDefinitions {
                    ...DefinitionContent
                    subDefinitions {
                      ...DefinitionContent
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

No er definisjonane flate. `flatDefinitions` gjev ei enkel liste av `FlatDefinition`-objekt, der kvart objekt peiker på kva nivå det ligg på. Gjenbygging av treet er mogleg frå denne lista om ein treng det.

<!--prettier-ignore-->
```graphql sandbox
query WordDefinitions(
  $word: String!
  $dictionaries: [Dictionary!]
  $wordClass: WordClass
) {
  word(
    word: $word
    dictionaries: $dictionaries
    wordClass: $wordClass
  ) {
    articles {
      id
      dictionary
      lemmas { lemma }
      gender
      wordClass
      flatDefinitions {
        parentIndex
        content { textContent }
      }
    }
  }
}
```

```json sandbox
{
  "word": "slag",
  "dictionaries": ["NorskOrdbok"],
  "wordClass": "Substantiv"
}
```

Kvart element i `flatDefinitions` har ein `parentIndex` som peikar på indeksen til definisjonen som det tilhøyrer i same liste, eller `null` for topp&shy;nivå&shy;definisjonar. Vil du byggje eit tre att, gruppér elementa etter `parentIndex`.

> [!NOTE]
> Somme definisjonar på toppnivå kan vera tomme. Slike fungerer berre som kategoriserings&shy;nodar for under&shy;definisjonar.

### `Lemma.meaning` vert `Lemma.homographNumber`

Feltet heit `meaning` før, men det det faktisk representerer er eit homograf&shy;nummer. Homograf&shy;nummer er eit tal som skil mellom identisk skrivne ord med ulik opphav eller tyding. Då er `homographNumber` meir presist.

## Kva kjem no?

No når den nye arkitekturen er på plass, og mykje ny funksjonalitet er komen med, vert fokuset i neste fase pålitelegheit. Med endringar kjem alltid risiko for feil. Då vert arbeidet framover å overvaka systemet nøye, fikse feil som dukkar opp, og gjera det so robust som mogleg.

Eg vonar at forbetringane i denne nye utgåva vil gjera Ordbok API endå nyttigare for alle som er interesserte i det norske språket.

Har du spørsmål eller idéar, eller kjem du over feil, er det berre å opne ei sak på [GitHub][github] eller taka kontakt med meg personleg på [Bluesky][bluesky].

[agpl]: https://www.gnu.org/licenses/agpl-3.0.html
[isc]: https://opensource.org/licenses/ISC
[reuse]: https://reuse.software/
[postgresql]: https://www.postgresql.org/
[meilisearch]: https://www.meilisearch.com/
[valkey]: https://valkey.io/
[apalis]: https://apalis.dev/
[relay-connections]: https://relay.dev/graphql/connections.htm
[uib-lisens]: https://www.uib.no/ub/spesialsamlingene/182212/lisens
[github]: https://github.com/ordbokapi/api
[bluesky]: https://bsky.app/profile/adaline.bsky.social
