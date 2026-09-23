import Link from 'next/link';
import { DELIVERY_COST, STORE } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import styles from './info-page.module.css';

type Block = { heading: string; body: React.ReactNode };
type Page = { title: string; intro?: string; blocks: Block[] };

export const INFO_PAGES = {
  dostava: {
    title: 'Dostava i povrat',
    intro: 'Sve što treba da znate o isporuci, povraćaju i zameni proizvoda.',
    blocks: [
      {
        heading: 'Dostava',
        body: `Porudžbine šaljemo kurirskom službom na teritoriji cele Srbije. Cena dostave je ${formatPrice(DELIVERY_COST)}, a rok isporuke je 2–4 radna dana. Lično preuzimanje je besplatno — javićemo vam kada je paket spreman.`,
      },
      {
        heading: 'Plaćanje',
        body: 'Plaćanje je pouzećem — gotovinom kuriru prilikom preuzimanja paketa, odnosno pri ličnom preuzimanju.',
      },
      {
        heading: 'Povrat',
        body: 'Proizvode možete vratiti u roku od 14 dana od prijema, pod uslovom da nisu nošeni i da imaju originalnu etiketu. Trošak povrata snosi kupac, osim u slučaju greške u porudžbini.',
      },
      {
        heading: 'Zamena',
        body: (
          <>
            Za zamenu veličine ili artikla pišite nam na{' '}
            <a href={`mailto:${STORE.email}`} className="link">
              {STORE.email}
            </a>{' '}
            i navedite broj porudžbine.
          </>
        ),
      },
    ],
  },
  velicine: {
    title: 'Vodič za veličine',
    intro: 'Merite preko donjeg veša, opušteno. Ako ste između dve veličine, preporučujemo veću.',
    blocks: [
      {
        heading: 'Kako izmeriti',
        body: 'Obim grudi merite preko najšireg dela, struk u najužem delu, a bokove preko najšireg dela.',
      },
      {
        heading: 'Ženska odeća',
        body: (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Veličina</th>
                <th>EU</th>
                <th>Grudi (cm)</th>
                <th>Struk (cm)</th>
                <th>Bokovi (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['XS', '32–34', '80–84', '62–66', '88–92'],
                ['S', '36', '84–88', '66–70', '92–96'],
                ['M', '38', '88–92', '70–74', '96–100'],
                ['L', '40', '92–96', '74–78', '100–104'],
                ['XL', '42', '96–102', '78–84', '104–110'],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ),
      },
      {
        heading: 'Muška odeća',
        body: (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Veličina</th>
                <th>EU</th>
                <th>Grudi (cm)</th>
                <th>Struk (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['S', '46', '88–94', '76–82'],
                ['M', '48–50', '94–100', '82–88'],
                ['L', '52', '100–106', '88–94'],
                ['XL', '54', '106–112', '94–100'],
                ['XXL', '56', '112–118', '100–106'],
              ].map((row) => (
                <tr key={row[0]}>
                  {row.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ),
      },
      {
        heading: 'Farmerke',
        body: 'Veličine farmerki (26–36) odgovaraju obimu struka u inčima. Na primer, veličina 30 odgovara struku od oko 76 cm.',
      },
      { heading: 'Napomena', body: 'Veličine se mogu blago razlikovati u zavisnosti od modela i materijala.' },
    ],
  },
  'cesta-pitanja': {
    title: 'Česta pitanja',
    blocks: [
      {
        heading: 'Kako da poručim?',
        body: 'Izaberite veličinu, dodajte proizvod u korpu i kliknite na „Poruči“. Poručivanje je moguće i bez registracije.',
      },
      {
        heading: 'Koje načine plaćanja podržavate?',
        body: 'Trenutno je moguće plaćanje pouzećem — gotovinom kuriru ili pri ličnom preuzimanju.',
      },
      {
        heading: 'Kako da pratim porudžbinu?',
        body: (
          <>
            Posle kupovine dobijate link ka stranici porudžbine sa trenutnim statusom. Ako imate nalog, sve porudžbine su
            vam u delu{' '}
            <Link href="/nalog" className="link">
              Moj nalog
            </Link>
            .
          </>
        ),
      },
      {
        heading: 'Zaboravio/la sam lozinku.',
        body: (
          <>
            Na stranici za prijavu kliknite na{' '}
            <Link href="/zaboravljena-lozinka" className="link">
              „Zaboravljena lozinka?“
            </Link>{' '}
            i poslaćemo vam link za postavljanje nove.
          </>
        ),
      },
      {
        heading: 'Kako da vratim ili zamenim proizvod?',
        body: (
          <>
            Pogledajte stranicu{' '}
            <Link href="/dostava" className="link">
              Dostava i povrat
            </Link>
            .
          </>
        ),
      },
    ],
  },
  uslovi: {
    title: 'Uslovi korišćenja',
    blocks: [
      {
        heading: 'Opšte',
        body: 'Korišćenjem sajta Furlada prihvatate ove uslove. Zadržavamo pravo izmene cena i dostupnosti artikala bez prethodne najave.',
      },
      {
        heading: 'Porudžbine',
        body: 'Porudžbina je obavezujuća nakon potvrde. Zadržavamo pravo da odbijemo porudžbinu u slučaju nedostupnosti artikla ili očigledne greške u ceni.',
      },
      {
        heading: 'Odgovornost',
        body: 'Trudimo se da svi podaci i slike budu tačni, ali ne garantujemo da su bez grešaka. Boje na fotografijama mogu blago odstupati zbog podešavanja ekrana.',
      },
    ],
  },
  privatnost: {
    title: 'Politika privatnosti',
    blocks: [
      {
        heading: 'Podaci koje prikupljamo',
        body: 'Prilikom registracije i kupovine prikupljamo ime, kontakt podatke i adresu isključivo radi obrade i isporuke porudžbine.',
      },
      {
        heading: 'Korišćenje podataka',
        body: 'Vaše podatke koristimo samo za isporuku porudžbina i komunikaciju sa vama. Ne prodajemo ih i ne ustupamo trećim licima, osim kurirskoj službi radi isporuke.',
      },
      {
        heading: 'Kolačići',
        body: 'Koristimo samo neophodne kolačiće za prijavu na nalog. Korpa i lista želja čuvaju se lokalno u vašem pregledaču.',
      },
      {
        heading: 'Vaša prava',
        body: `Možete zatražiti uvid, izmenu ili brisanje svojih podataka slanjem zahteva na ${STORE.email}.`,
      },
    ],
  },
} satisfies Record<string, Page>;

export type InfoSlug = keyof typeof INFO_PAGES;

const NAV: { slug: InfoSlug; label: string }[] = [
  { slug: 'dostava', label: 'Dostava i povrat' },
  { slug: 'velicine', label: 'Vodič za veličine' },
  { slug: 'cesta-pitanja', label: 'Česta pitanja' },
  { slug: 'uslovi', label: 'Uslovi korišćenja' },
  { slug: 'privatnost', label: 'Politika privatnosti' },
];

export function InfoPage({ slug }: { slug: InfoSlug }) {
  const page: Page = INFO_PAGES[slug];
  return (
    <div className={`container page ${styles.layout}`}>
      <nav className={styles.nav} aria-label="Informacije">
        {NAV.map((n) => (
          <Link key={n.slug} href={`/${n.slug}`} className={n.slug === slug ? styles.active : undefined}>
            {n.label}
          </Link>
        ))}
      </nav>
      <article className={styles.article}>
        <span className="eyebrow">Informacije</span>
        <h1 className="page-title">{page.title}</h1>
        {page.intro && <p className={styles.intro}>{page.intro}</p>}
        {page.blocks.map((b) => (
          <section key={b.heading} className={styles.block}>
            <h2>{b.heading}</h2>
            <div>{b.body}</div>
          </section>
        ))}
      </article>
    </div>
  );
}
