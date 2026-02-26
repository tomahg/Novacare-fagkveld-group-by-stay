# GroupByStay

Intern app for gruppeinndeling på arrangementer. Deltakere melder seg på med navn og hvor lenge de blir — appen fordeler folk i grupper slik at avgangstidene spres jevnt.

## Sider

- `/` — Hovedvisning med QR-kode og gruppeoversikt (vises på storskjerm)
- `/join` — Påmeldingsskjema (åpnes via QR-kode på mobil)
- `/admin` — Sett antall grupper, se oversikt, fjern deltakere

## Kjøre lokalt

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000). Data lagres i minnet — forsvinner ved restart.

## Deploy til Vercel

Krever Upstash Redis. Opprett en gratis database på [upstash.com](https://upstash.com) og sett miljøvariablene:

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Legg logoen som `public/logo.png`.
