import { ArrowRight, Banknote, RotateCcw, Truck, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/product-grid';
import { STORE } from '@/lib/constants';
import { toCardProduct } from '@/lib/product';
import { getFeaturedProducts, getNewestProducts } from '@/lib/queries';
import { cx } from '@/lib/utils';
import styles from './home.module.css';

const u = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const CATEGORIES = [
  { title: 'Žene', href: '/prodavnica?pol=zene', image: u('1485968579580-b6d095142e6e', 900, 1200) },
  { title: 'Muškarci', href: '/prodavnica?pol=muskarci', image: u('1617137968427-85924c800a22', 900, 1200) },
  { title: 'Aksesoari', href: '/prodavnica?kategorija=aksesoari', image: u('1559563458-527698bf5295', 900, 1200) },
];

const PERKS = [
  { Icon: Truck, title: 'Dostava 2–4 dana', text: 'Kurirskom službom na teritoriji cele Srbije.' },
  { Icon: RotateCcw, title: 'Povrat 14 dana', text: 'Jednostavan povrat i zamena veličine.' },
  { Icon: Banknote, title: 'Plaćanje pouzećem', text: 'Platite gotovinom kuriru pri preuzimanju.' },
  { Icon: MessageCircle, title: 'Tu smo za vas', text: `Pišite nam na ${STORE.email}.` },
];

async function Featured() {
  const products = await getFeaturedProducts(8);
  return <ProductGrid products={products.map(toCardProduct)} />;
}

async function Newest() {
  const products = await getNewestProducts(4);
  return <ProductGrid products={products.map(toCardProduct)} />;
}

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <Image
          src={u('1445205170230-053b83016050', 2400, 1400)}
          alt=""
          fill
          preload
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={cx('container', styles.heroContent)}>
          <span className={styles.heroEyebrow}>Nova sezonska kolekcija</span>
          <h1>
            Komadi koje ćete
            <br />
            <em>nositi godinama</em>
          </h1>
          <p>Bezvremenski krojevi, prirodni materijali i detalji koji prave razliku.</p>
          <div className={styles.heroActions}>
            <Link href="/prodavnica?pol=zene" className="btn btn-light">
              Za nju
            </Link>
            <Link href="/prodavnica?pol=muskarci" className={cx('btn', styles.heroGhost)}>
              Za njega
            </Link>
          </div>
        </div>
      </section>

      <section className={cx('container', styles.section)}>
        <div className={styles.categories}>
          {CATEGORIES.map((c) => (
            <Link key={c.title} href={c.href} className={styles.category}>
              <Image src={c.image} alt={c.title} fill sizes="(max-width: 760px) 100vw, 33vw" />
              <div className={styles.categoryLabel}>
                <h2>{c.title}</h2>
                <span>
                  Pogledaj <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={cx('container', styles.section)}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">Izbor stilista</span>
            <h2>Izdvajamo iz ponude</h2>
          </div>
          <Link href="/prodavnica" className={styles.viewAll}>
            Sve proizvode <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={8} />}>
          <Featured />
        </Suspense>
      </section>

      <section className={styles.editorial}>
        <div className={styles.editorialImage}>
          <Image src={u('1539533018447-63fcce2678e3', 1200, 1400)} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" />
        </div>
        <div className={styles.editorialText}>
          <span className="eyebrow">Sezonsko sniženje</span>
          <h2>Omiljeni komadi po nižim cenama</h2>
          <p>
            Odabrani modeli jakni, haljina i aksesoara su na akciji. Količine su ograničene — kada nestane,
            nema ga više.
          </p>
          <Link href="/prodavnica?akcija=1" className="btn">
            Pogledaj akciju
          </Link>
        </div>
      </section>

      <section className={cx('container', styles.section)}>
        <div className={styles.sectionHead}>
          <div>
            <span className="eyebrow">Upravo stiglo</span>
            <h2>Novo u ponudi</h2>
          </div>
          <Link href="/prodavnica?sort=najnovije" className={styles.viewAll}>
            Sve novo <ArrowRight size={14} />
          </Link>
        </div>
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <Newest />
        </Suspense>
      </section>

      <section className={styles.perks}>
        <div className={cx('container', styles.perksGrid)}>
          {PERKS.map(({ Icon, title, text }) => (
            <div key={title} className={styles.perk}>
              <Icon size={26} strokeWidth={1.2} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
