# Furlada Shop — Handoff

> Stanje posle migracije sa CRA + Firebase na **Next.js 16 + Postgres** (grana `next-migration`, 2026-09-23).
> Stara CRA verzija je sačuvana u commit-u `74c2b7f` i na grani `main`.

## Pokretanje

```bash
npm run db:up      # Docker Postgres na portu 5434 (5432/5433 zauzimaju lokalni Postgres servisi)
npm run dev        # http://localhost:3000
```

Detaljno u `README.md`. Lokalni admin: `stokic@gmail.com`, lozinka iz `SEED_ADMIN_PASSWORD` u `.env`. Test kupci (samo lokalno): `*@example.com`.

## Stack

| Sloj | Tehnologija |
|---|---|
| Framework | Next.js 16.3 (App Router, Turbopack), React 19, TypeScript |
| Baza | PostgreSQL 17 (Docker lokalno), Drizzle ORM + drizzle-kit migracije |
| Auth | Better Auth 1.7 (email/lozinka, sesije u Postgresu), uloga `user`/`admin` na tabeli `user` |
| Validacija | zod 4 |
| Stilovi | CSS Modules + globalni tokeni u `src/app/globals.css` (bez Tailwinda) |
| Fontovi | EB Garamond (naslovi) + Montserrat (tekst), preko `next/font` |
| Slike | `next/image`; seed koristi Unsplash, admin upload ide u `uploads/` (sharp → WebP) |

## Važne odluke i zamke

- **Next 16:** `middleware.ts` se sada zove `proxy.ts`; `params`/`searchParams` su Promise; `priority` na `<Image>` je zastareo → `preload` ili `loading="eager"`. Pre pisanja koda pogledati `node_modules/next/dist/docs/` (vidi `AGENTS.md`).
- **Sve stranice su dinamičke** (header čita sesiju). `cacheComponents` nije uključen namerno.
- **Admin zaštita u 3 sloja:** `proxy.ts` (samo da li postoji kolačić), `admin/layout.tsx`, i **svaka admin stranica zove `requireAdminPage()`** a **svaka admin akcija `requireAdmin()`** — layout se ne renderuje ponovo pri klijentskoj navigaciji, pa nije dovoljan sam.
- `requireAdmin`/`getFreshUser` čitaju sesiju bez keša kolačića (oduzeta prava važe odmah); `getCurrentUser` koristi keš od 5 min.
- **Cene uvek računa server** (`app/actions/checkout.ts`) — klijent šalje samo ID, veličinu i količinu.
- **Stavke porudžbine su snimak** (naziv, cena, slika) — brisanje/izmena proizvoda ne menja istoriju.
- Porudžbinu gosta vidi svako ko ima link (UUID); porudžbinu registrovanog kupca samo on i admin.
- **Cormorant font je izbačen:** Google verzija pogrešno pozicionira kvačice na č/š/ž/ć. Zamenjen EB Garamondom.
- Datumi/brojevi: locale `sr-Latn-RS` (samo `sr-RS` daje ćirilicu).
- CSS Modules hešuju i globalne klase — za `.input`, `.select` i sl. unutar modula koristiti `:global(.input)`.
- Globalna klasa `.page` daje samo vertikalni padding (kombinuje se sa `.container`).
- Drizzle u upitima nad jednom tabelom ne kvalifikuje kolone — u `sql\`\`` podupitima to pravi pogrešne reference; koristiti JOIN + GROUP BY.
- Pretraga ignoriše kvačice („kosulja“ nalazi „košulja“) — `translate()` u SQL-u, `foldText()` u JS-u.

## Baza (src/db/schema.ts)

`user`, `session`, `account`, `verification` (Better Auth) · `subcategories` (vrste sa dozvoljenim veličinama/bojama — zamena za Firestore `attributes` i hardkodovane liste) · `products` · `orders` (čitljiv broj od #1001) · `order_items`.

Izmena šeme: izmeniti `schema.ts` → `npm run db:generate` → `npm run db:migrate`.

## Rute

Prodavnica: `/`, `/prodavnica?kategorija=&vrsta=&pol=&q=&boja=&velicina=&min=&max=&akcija=1&sort=&strana=`, `/proizvod/[slug]`, `/korpa`, `/porucivanje`, `/porudzbina/[id]`, `/lista-zelja`, `/prijava`, `/registracija`, `/zaboravljena-lozinka`, `/nova-lozinka`, `/nalog`, `/nalog/podaci`, `/nalog/lozinka`, `/dostava`, `/velicine`, `/cesta-pitanja`, `/uslovi`, `/privatnost`.

Admin: `/admin`, `/admin/porudzbine[/id]`, `/admin/proizvodi` (+ `/novi`, `/[id]`), `/admin/vrste`, `/admin/korisnici`.

## Firebase

Firestore podaci su **obrisani 2026-09-23** (35 dokumenata: admins 1, attributes 21, orders 5, products 5, users 3). Firebase Auth nalozi (7) i sam Firebase projekat **nisu dirani**. `serviceAccountKey.json` je još u folderu (gitignorisan) — aplikacija ga više ne koristi.

## Šta je otvoreno

- [ ] Email provajder (`src/lib/email.ts` — sada samo konzola)
- [ ] Hosting baze i aplikacije; storage slika za serverless (S3/R2)
- [ ] Zalihe po veličini (sada nema praćenja stanja — sve je „na stanju“)
- [ ] Online plaćanje karticom (uklonjena lažna opcija; enum `payment_method` se lako proširuje)
- [ ] Lista želja se čuva samo u browseru (localStorage), ne na nalogu
- [ ] Tabele u vodiču za veličine sadrže tipične EU mere — proveriti sa stvarnim krojevima
- [ ] Obrisati Firebase projekat / Auth naloge kada više nisu potrebni
