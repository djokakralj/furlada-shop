# Furlada Shop

Online prodavnica odeće i aksesoara — Next.js 16 (App Router) + PostgreSQL (Drizzle ORM) + Better Auth.

## Pokretanje (lokalno)

Potrebno: Node.js 22+, Docker Desktop.

```bash
npm install
cp .env.example .env          # pa popuniti BETTER_AUTH_SECRET i SEED_ADMIN_*
npm run db:up                 # Postgres u Dockeru (port 5434)
npm run db:migrate            # tabele
npm run db:seed               # test podaci + admin nalog
npm run dev                   # http://localhost:3000
```

Admin panel: `/admin` (nalog iz `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
Test kupci: `marija.petrovic@example.com`, `jovan.nikolic@example.com`, `ana.jovanovic@example.com` — lozinka `furlada123`.

## Skripte

| Komanda | Šta radi |
|---|---|
| `npm run dev` | dev server |
| `npm run build` / `npm start` | produkcijski build / pokretanje |
| `npm run typecheck`, `npm run lint` | provere |
| `npm run db:up` / `db:down` | pokreće / gasi Postgres kontejner |
| `npm run db:generate` | nova migracija posle izmene `src/db/schema.ts` |
| `npm run db:migrate` | primenjuje migracije |
| `npm run db:seed` | puni praznu bazu test podacima |
| `npm run db:reset` | briše lokalnu bazu, migrira i puni iznova (samo localhost) |
| `npm run db:studio` | Drizzle Studio — pregled tabela u browseru |

## Struktura

```
src/
├── app/
│   ├── (shop)/            # prodavnica: početna, prodavnica, proizvod, korpa, poručivanje,
│   │                      # porudžbina, nalog, lista želja, info stranice, (auth)/prijava…
│   ├── admin/             # admin panel: pregled, porudžbine, proizvodi, vrste, korisnici
│   ├── actions/           # server akcije (checkout, auth, admin, catalog)
│   ├── api/auth/          # Better Auth endpoint
│   └── uploads/           # servira slike otpremljene iz admina
├── components/            # layout (header/footer), product, cart, order, ui, providers
├── db/                    # Drizzle šema + konekcija
├── lib/                   # auth, session, queries, admin-queries, storage, validation, utils
└── proxy.ts               # brza provera sesije za /admin i /nalog
scripts/                   # seed, reset
drizzle/                   # SQL migracije
```

## Produkcija — šta treba podesiti

- **Baza:** bilo koji Postgres (Neon, Supabase, VPS…) — samo `DATABASE_URL`, pa `npm run db:migrate`.
- **Email:** `src/lib/email.ts` trenutno ispisuje poruke u konzolu (reset lozinke, potvrda emaila, potvrda porudžbine). Treba povezati provajdera (Resend, SMTP…).
- **Slike:** `src/lib/storage.ts` čuva otpremljene slike na disk (`uploads/`). Na VPS-u radi kako jeste; za serverless hosting zameniti S3/R2/Blob storage-om.
- `BETTER_AUTH_URL` i `NEXT_PUBLIC_SITE_URL` postaviti na pravi domen.
