# Furlada Shop — Handoff 2 (sesija 2026-09-23)

> Migracija sa **CRA + Firebase** na **Next.js 16 + PostgreSQL + Better Auth**.
> Sav rad je na grani `next-migration`; `main` je netaknut (stara CRA verzija).

## Brzi start

```bash
npm install
npm run db:up      # Docker Postgres 17 na portu 5434
npm run dev        # http://localhost:3000
```

Prvi put (ili za čistu bazu): `npm run db:reset` — briše lokalnu bazu, pokreće migracije i seed.

| Nalog | Email | Lozinka |
|---|---|---|
| Admin | `stokic@gmail.com` | `stokic123` (iz `.env`) |
| Test kupci | `marija.petrovic@example.com`, `jovan.nikolic@example.com`, `ana.jovanovic@example.com` | `furlada123` |

Admin panel: `/admin`. Detaljno uputstvo i sve skripte: `README.md`.

## Šta je urađeno u ovoj sesiji

1. **Sačuvan stari rad** — necommit-ovane izmene CRA verzije iz jula commit-ovane su na granu `next-migration` (`74c2b7f`) pre bilo kakvog brisanja.
2. **Nova osnova** — Next.js 16.3 (App Router, Turbopack) + TypeScript u istom repou. CRA fajlovi uklonjeni iz radnog stabla (ostaju u git istoriji).
3. **Baza** — Postgres u Dockeru (`docker-compose.yml`), Drizzle ORM, migracija `drizzle/0000_init.sql`. Seed (`scripts/seed.ts` + `scripts/seed-data.ts`): 21 vrsta, 44 proizvoda sa Unsplash fotografijama, admin, 3 test kupca, 6 porudžbina.
4. **Auth** — Better Auth: prijava, registracija, reset lozinke, verifikacija emaila (ne blokira kupovinu), uloge `user`/`admin`.
5. **Prodavnica (prepisana i doterana)**
   - header sa mega menijem, pretragom i mobilnim menijem; bočna korpa
   - katalog `/prodavnica` — filteri (boja, veličina, cena, akcija) i sortiranje na serveru, sve u URL-u; pretraga bez kvačica („kosulja“ → „košulja“)
   - stranica proizvoda — galerija, izbor veličine, količina, slični proizvodi, SEO metapodaci
   - poručivanje — validacija, **cene računa server**, gost ili nalog, čuvanje adrese u profilu, email potvrda (za sada u konzoli)
   - praćenje porudžbine sa statusom, nalog (porudžbine / podaci / lozinka), lista želja, info stranice, 404
6. **Admin panel (prepisan i proširen)**
   - pregled: promet 30 dana, grafikon 14 dana, najprodavanije, poslednje porudžbine
   - porudžbine: filteri po statusu, pretraga, promena statusa, **adresa dostave u listi i u detaljima + „Otvori na mapi“**
   - proizvodi: dodavanje **i izmena**, upload slika (sharp → WebP), prekidači aktivan/izdvojen, brisanje uz potvrdu
   - vrste i atributi: veličine i boje po vrsti, dodavanje/brisanje vrsta
   - korisnici: pregled potrošnje, dodela admin prava
7. **Firestore obrisan** (35 dokumenata) nakon što je nova verzija proverena. Firebase Auth nalozi (7) i Firebase projekat nisu dirani.
8. **Testirano u browseru:** kupovina kao gost, prijava i pogrešna lozinka, popunjavanje iz profila, admin tokovi, zaštita admina od običnog korisnika, mobilni prikaz. `npm run build`, `typecheck` i `lint` prolaze.

Commit-i na grani `next-migration`: `74c2b7f` (stari CRA rad) → `50309d2` (migracija) → `2e3189c` (adresa u adminu).

## Stack

| Sloj | Tehnologija |
|---|---|
| Framework | Next.js 16.3, React 19, TypeScript |
| Baza | PostgreSQL 17 (Docker), Drizzle ORM + drizzle-kit |
| Auth | Better Auth 1.7 |
| Validacija | zod 4 |
| Stilovi | CSS Modules + tokeni u `src/app/globals.css` |
| Fontovi | EB Garamond (naslovi) + Montserrat (tekst) |

## Važne odluke i zamke

- **Next 16:** `middleware.ts` → `proxy.ts`; `params`/`searchParams` su Promise; `priority` na `<Image>` je zastareo → `preload` / `loading="eager"`. Pre pisanja koda pogledati `node_modules/next/dist/docs/`.
- **Admin zaštita u 3 sloja:** `proxy.ts` (kolačić), `admin/layout.tsx`, i **svaka admin stranica zove `requireAdminPage()`, svaka admin akcija `requireAdmin()`** — layout se ne renderuje ponovo pri klijentskoj navigaciji.
- `requireAdmin` čita sesiju bez keša (oduzeta prava važe odmah); `getCurrentUser` ima keš 5 min.
- Stavke porudžbine čuvaju snimak naziva/cene/slike — izmena ili brisanje proizvoda ne menja istoriju.
- Porudžbinu gosta vidi ko ima link (UUID); porudžbinu registrovanog kupca samo on i admin.
- **Cormorant izbačen** — Google verzija pogrešno postavlja kvačice na č/š/ž/ć.
- Datumi i brojevi: `sr-Latn-RS` (`sr-RS` daje ćirilicu).
- U CSS modulima globalne klase pisati kao `:global(.input)`.
- `.page` daje samo vertikalni padding (kombinuje se sa `.container`).
- Drizzle ne kvalifikuje kolone u upitima nad jednom tabelom → u podupitima koristiti JOIN + GROUP BY.
- Izmena šeme: `src/db/schema.ts` → `npm run db:generate` → `npm run db:migrate`.

## Otvoreno za sledeću sesiju

- [ ] Hosting baze i aplikacije
- [ ] Email provajder (`src/lib/email.ts` — sada samo ispis u konzolu)
- [ ] Storage slika za serverless hosting (S3/R2) — sada `uploads/` na disku
- [ ] Zalihe po veličini (sada je sve „na stanju“)
- [ ] Online plaćanje karticom (lažna opcija uklonjena)
- [ ] Lista želja na nalogu (sada samo u browseru)
- [ ] Proveriti mere u tabelama vodiča za veličine (tipične EU vrednosti)
- [ ] Obrisati Firebase projekat / Auth naloge i `serviceAccountKey.json` kada više ne trebaju
- [ ] Spojiti `next-migration` u `main`
