# Furlada Shop — Handoff dokument

## Pokretanje projekta

```bash
cd C:\Users\Korisnik\furlada-shop\furlada-shop
npm start
```

Otvara se na `http://localhost:3000`. React CRA (create-react-app), ne Vite, ne Next.js — jedini validan script je `npm start`.

---

## Stack

| Sloj | Tehnologija |
|---|---|
| Framework | React 18, CRA (`react-scripts`) |
| Routing | wouter v3.6.0 |
| Baza podataka | Firebase Firestore |
| Auth | Firebase Auth (email/password) |
| Ikone | lucide-react (react-icons je uklonjen) |
| Fontovi | Cormorant (naslovi) + Montserrat (tijelo), Google Fonts |
| Stilovi | CSS custom properties (bez Tailwinda, bez CSS Modulesa) |
| Stanje korpe | CartContext + localStorage |
| Notifikacije | ToastContext (custom) |

---

## Firebase projekt

- **Project ID:** `furlada-shop`
- **Auth domain:** `furlada-shop.firebaseapp.com`
- **Config fajl:** `src/data/firebase.js` — eksportuje `db`, `auth`, `app`

### Kolekcije u Firestore-u

| Kolekcija | Sadržaj |
|---|---|
| `products` | Svi proizvodi (name, price, category, subcategory, color, sizes[], imageUrl, description, brand, gender) |
| `attributes` | Po vrsti proizvoda (doc ID = podkategorija): category, sizes[], colors[] — uređuje se na `/admin/atributi` |
| `orders` | Porudžbine (customer, items[], delivery, payment, total, status, createdAt, userId) |
| `users` | Profili korisnika (name, surname, phone, email, address{}) |
| `admins` | Samo email adrese admina — ko je ovde, `isAdmin` je `true` |

### Admin provjera

`AuthContext.js` pri loginu radi query na `admins` kolekciju po emailu. Nema role-based auth u Firebase-u — samo Firestore lookup.

---

## Routing (wouter v3)

**Kritično:** `useRoute` u wouter v3 vraća `[match, params]` tuple, ne samo `params`.

```js
// ISPRAVNO
const [, params] = useRoute('/product/:id');

// POGREŠNO — vraća boolean, ne params
const [params] = useRoute('/product/:id');
```

Sve rute su u `App.js`:

| Ruta | Komponenta |
|---|---|
| `/` | HomePage |
| `/search?category=odeca` | SearchResults |
| `/search?query=tekst` | SearchResults |
| `/product/:id` | ProductPage |
| `/cart` | CartPage |
| `/checkout` | CheckoutPage |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/profile` | ProfilePage |
| `/admin` | AdminLayout + AdminDashboard (pregled/statistika) |
| `/admin/proizvodi` | AdminLayout + AdminProducts |
| `/admin/porudzbine` | AdminLayout + AdminOrders |

SearchResults se remountuje na svaku promjenu URL query stringa:
```jsx
<Route path="/search">
  {() => <SearchResults key={window.location.search} />}
</Route>
```

---

## Design system

CSS varijable definirane u `src/index.css`:

```css
--primary: #111111
--primary-light: #404040
--accent: #C9A96E        /* zlatna/champagne */
--accent-dark: #A8843A
--white: #ffffff
--surface: #F7F6F2       /* topla bijela, pozadine sekcija */
--gray-100: #F7F6F2
--gray-200: #E8E7E3      /* borders */
--gray-400: #AAAAAA      /* placeholder tekst */
--gray-600: #666666      /* sekundarni tekst */
--gray-900: #111111
--font-heading: 'Cormorant', Georgia, serif
--font-body: 'Montserrat', 'Helvetica Neue', Arial, sans-serif
```

**Ne postoji** `--gray-300`, `--gray-500`, `--gray-700`, `--gray-800` — koristi samo gore navedene.

---

## Struktura fajlova

```
src/
├── App.js                    # Routing + Provider wrapper
├── App.css                   # Samo overflow-x: hidden + .main-content flex
├── index.css                 # Design system varijable + base reset
│
├── context/
│   ├── CartContext.js         # Korpa, localStorage, cartKey kompozitni ključ
│   └── AuthContext.js         # Firebase Auth, isAdmin provjera
│
├── components/
│   ├── Header.js / .css       # Nav, cart badge, search, dropdown, mobilni meni
│   ├── Footer.js / .css       # Newsletter, 4 kolone, bottom bar
│   ├── ProductCard.js         # Kartica za home page
│   └── Toast.js / .css        # ToastProvider + useToast hook
│
├── pages/
│   ├── HomePage.js / .css     # Hero, kategorije, featured products
│   ├── ProductPage.js / .css  # Sticky galerija, accordion, breadcrumb
│   ├── SearchResults.js / .css # Filter sidebar + product grid
│   ├── CartPage.js / .css     # Lista korpe, totali
│   ├── CheckoutPage.js / .css # Forma + order summary, success screen
│   ├── LoginPage.js / .css    # Login + password reset
│   ├── RegisterPage.js        # Registracija
│   ├── ProfilePage.js / .css  # Profil korisnika
│   └── admin/
│       ├── AdminLayout.js     # Guard (isAdmin) + sidebar navigacija
│       ├── AdminDashboard.js  # /admin — statistika + poslednje porudžbine
│       ├── AdminProducts.js   # /admin/proizvodi — forma + lista sa pretragom
│       ├── AdminOrders.js     # /admin/porudzbine — kartice + filter po statusu
│       └── Admin.css          # Svi admin stilovi
│
└── data/
    ├── firebase.js            # Firebase init, eksportuje db + auth
    ├── products.js            # getProducts() — dohvata iz Firestore-a
    └── seed.js                # Seed skript za inicijalnu bazu
```

---

## Korpa — CartContext

Kompozitni ključ sprječava da isti proizvod u različitim veličinama/bojama bude isti item:

```js
const cartKey = (item) => `${item.id}__${item.size || ''}__${item.color || ''}`;
```

Context eksportuje: `{ cartItems, cartKey, addToCart, removeFromCart, updateQuantity, clearCart }`

Korpa se čuva u `localStorage` pod ključem `'cart'` i briše se pri logout.

---

## Toast notifikacije

```js
import { useToast } from '../components/Toast';
const { showToast } = useToast();
showToast('Poruka ovde');            // success (default)
showToast('Greška', 'error');        // error
```

`ToastProvider` mora biti **najspoljašnjiji** wrapper u `App.js` (iznad CartProvider i AuthProvider) jer i Cart i Auth mogu da triggeruju toast.

---

## Checkout — logika cijene

```js
const DELIVERY_COST = 300;                          // RSD, kurirska dostava
const itemsTotal = cartItems.reduce((t, i) => t + i.price * (i.quantity || 1), 0);
const deliveryCost = form.delivery === 'kurir' ? DELIVERY_COST : 0;
const totalPrice = itemsTotal + deliveryCost;
```

Opcije: `kurir` (300 RSD) ili `preuzimanje` (0). Plaćanje: `pouzece` ili `kartica`.

Uspješna porudžbina se snima u Firestore `orders` sa statusom `"primljena"`, pa se korpa prazni.

---

## SearchResults — filteri

Filtriranje je **client-side** — Firestore se queryuje samo kad se promijeni kategorija ili search query. Filter promjene (cijena, boja, veličina) su instant bez mrežnih zahtjeva.

```
Firestore fetch (jednom) → allProducts state
          ↓
Client-side filter effect → filtered state
          ↓
Sort (client) → sortedResults
```

Dostupne boje i veličine se dinamički izvlače iz podataka — nisu hardcoded.

---

## ProductPage — kritičan bug (riješen)

`useRoute` vraćao boolean umjesto params, pa proizvod nikad nije bio pronađen:

```js
// STARO — bug
const [params] = useRoute('/product/:id');  // params = true/false

// NOVO — ispravno
const [, params] = useRoute('/product/:id');  // params = { id: '...' }
```

---

## Poznata ograničenja / šta nije urađeno

1. **Nema image uploada** — `imageUrl` je eksterni URL koji se unosi ručno u admin panelu
2. **Nema paginacije** — svi proizvodi se učitavaju odjednom iz Firestore-a
3. **Kartica plaćanje** je fake — nema payment gateway integracije
4. **`/register` nema guard** — korisnik može registrovati račun bez email verifikacije
5. **AdminPage nema route guard** — provjera `isAdmin` je samo u samoj komponenti (UI-level), ali ruta `/admin` je javno dostupna
6. **Nema slike za kategorije** — koriste se Unsplash placeholder URL-ovi
7. **Firebase API key** je u repozitorijumu u plaintext — za produkciju premjestiti u `.env`

---

## Potencijalni sljedeći koraci

- [ ] Firebase Storage za upload slika u admin panelu
- [ ] Route guard za `/admin` na routing nivou
- [ ] Premjestiti Firebase config u `.env.local`
- [ ] Email verifikacija pri registraciji
- [x] Stranica za praćenje statusa porudžbine (`/order/:id`)
- [x] Wishlist funkcionalnost
- [x] Podkategorija filter (izložen kroz Header dropdown → `?subcategory=`)
- [x] Paginacija ("Prikaži još" na SearchResults)

---

## Sesija 2026-07-01 — ispravke logike + UX

**Deljene konstante (`src/data/constants.js`):** dodati `NO_IMAGE` (SVG placeholder, koristi se u ProductCard/CartPage/CheckoutPage), `ORDER_STATUS_LABEL`, `DELIVERY_LABEL`, `PAYMENT_LABEL`.

**Ispravke:**
- `App.js` — `ScrollToTop` komponenta (wouter ne skroluje na vrh pri promeni rute) + stilizovana 404 stranica (`NotFound`, CSS u `App.css`)
- `Header` — badge korpe se krije kad je 0; pretraga dodata u mobilni burger meni (bila potpuno nedostupna na mobilnom); meni se zatvara posle pretrage
- `CheckoutPage` — `submitting` guard (dupli klik je pravio duplu porudžbinu u Firestore); adresa se traži/prikazuje samo za kurirsku dostavu (za lično preuzimanje `customer.address = null`); redosled: način dostave iznad adrese
- `LoginPage` — "korisničko ime" → "Email adresa" (uvek je bio email); ulogovan korisnik se preusmerava na `/profile`; `<a>` → wouter `<Link>`
- `RegisterPage` — posle registracije korisnik ide na `/profile` (createUser ga odmah uloguje — ranije je slat na /login); `submitting` state
- `ProfilePage` — porudžbine bez `orderBy` u queryju (where+orderBy traži kompozitni indeks pa je lista tiho pucala), sortiranje klijentski po `createdAt.seconds`
- `AdminPage` — potvrda pre brisanja proizvoda; status porudžbine je select sa sva 4 statusa (bio checkbox sa 2); čitljivi nazivi dostave/plaćanja
- `OrderPage` — čitljivi nazivi dostave/plaćanja; adresa se renderuje samo ako postoji
- `Footer` — "Ženska/Muška odeća" linkovi sada nose `&gender=` (vodili su na isti URL)
- `ProductPage` — "Vodič za veličine" je sada `<Link href="/velicine">`
- `HomePage` — hero i kategorije se prikazuju odmah (ranije je cela stranica čekala Firestore); skeleton kartice za featured sekciju dok se učitava
- `SearchResults` — naslov stranice (`search-page-title`) pokazuje kontekst: upit / kategoriju / podkategoriju + pol
- Sve cene formatirane sa `toLocaleString('sr-RS')`

**Napomena o encodingu:** fajlovi su UTF-8 bez BOM-a — ne koristiti PowerShell `Get-Content`/`Set-Content` za izmene (kvari š/ž/č u mojibake).

---

## Sesija 2026-07-02 — novi admin panel

Stari `AdminPage.js/.css` (tabovi u jednoj stranici) obrisan i zamenjen strukturom `src/pages/admin/`:

- **`/admin`** (AdminDashboard) — stat kartice (broj proizvoda, ukupno porudžbina, nove porudžbine, ukupan promet) + poslednjih 5 porudžbina sa status badge-ovima
- **`/admin/proizvodi`** (AdminProducts) — forma za dodavanje je collapsible ("Novi proizvod" dugme), sva polja sa labelima u grid layoutu, veličine kao pill toggle dugmad; lista proizvoda kao redovi sa thumbnail/meta/cena/delete, plus klijentska pretraga po nazivu i podkategoriji
- **`/admin/porudzbine`** (AdminOrders) — kartice sa datumom, status badge-om u boji, linkom na javnu `/order/:id`, stavkama i select-om za promenu statusa; filter po statusu sa brojačima
- **AdminLayout** — isAdmin guard + sticky sidebar (desktop) / horizontalni tabovi (mobilno), aktivna stavka označena zlatnom (accent) bordurom
- Alerti zamenjeni toast notifikacijama (`useToast`)
- Status badge boje: primljena (zlatna), uobradi (plava), poslata (ljubičasta), ispunjena (zelena)

### Atributi po vrsti proizvoda (`/admin/atributi`)

- Firestore kolekcija **`attributes`** — doc ID = podkategorija (npr. `Majice`), polja: `category`, `subcategory`, `sizes[]`, `colors[]`
- `AdminAttributes.js` — klik na vrstu otvara editor: veličine kao chips (dodavanje/brisanje, slobodan unos — radi i numeričke npr. `32`), boje kao toggle chips sa color dot-om (paleta iz `colorTranslationMap`)
- **`AdminProducts` forma čita atribute**: izbor podkategorije određuje ponuđene veličine i boje; promena vrste resetuje izabranu boju/veličine; vrste bez veličina (aksesoari) ne prikazuju sekciju veličina i ne zahtevaju je
- Fallback ako vrsta nema zapis u `attributes`: odeća = `FORM_SIZES`, sve boje

### Skripte (koriste `serviceAccountKey.json` + firebase-admin, zaobilaze Firestore rules)

- `scripts/dumpProducts.js` — ispis svih proizvoda
- `scripts/backfillAttributes.js` — idempotentan: seed `attributes` kolekcije (preskače postojeće docove) + dopuna proizvoda (subcategory/gender po nazivu, boja u mala slova, `id` polje)
- Pokretanje: `node scripts\backfillAttributes.js` — **izvršeno 2026-07-02**: 21 vrsta dobila atribute (Farmerke 26–36, Veš S–XL, aksesoari bez veličina + 7 boja galanterije, ostalo XS–XXL + svih 16 boja); svih 5 proizvoda popunjeno
