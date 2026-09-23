import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/product-grid';
import { CATEGORY_LABEL, GENDER_LABEL } from '@/lib/constants';
import { toCardProduct } from '@/lib/product';
import {
  getSubcategories,
  getSubcategoryCounts,
  parseCatalogParams,
  searchProducts,
  type CatalogFilters,
} from '@/lib/queries';
import type { Subcategory } from '@/db/schema';
import { cx, plural } from '@/lib/utils';
import { CatalogControls, LoadMore } from './catalog-controls';
import styles from './catalog.module.css';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function describe(f: CatalogFilters, subs: Subcategory[]) {
  const sub = f.subcategory ? subs.find((s) => s.slug === f.subcategory) : undefined;
  const genderSuffix = f.gender ? ` — ${GENDER_LABEL[f.gender]}` : '';
  if (f.q) return { title: `Rezultati za „${f.q}“`, eyebrow: 'Pretraga', sub };
  if (sub) return { title: sub.name + genderSuffix, eyebrow: CATEGORY_LABEL[sub.category], sub };
  if (f.category) return { title: CATEGORY_LABEL[f.category] + genderSuffix, eyebrow: 'Kolekcija', sub };
  if (f.gender) return { title: GENDER_LABEL[f.gender], eyebrow: 'Kolekcija', sub };
  if (f.sale) return { title: 'Akcija', eyebrow: 'Sniženo', sub };
  if (f.sort === 'najnovije') return { title: 'Novo u ponudi', eyebrow: 'Upravo stiglo', sub };
  return { title: 'Svi proizvodi', eyebrow: 'Prodavnica', sub };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [f, subs] = await Promise.all([searchParams.then(parseCatalogParams), getSubcategories()]);
  return { title: describe(f, subs).title };
}

// Gradi URL kataloga zadržavajući "kontekst" (pol, pretraga…)
function catalogHref(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/prodavnica?${s}` : '/prodavnica';
}

export default async function CatalogPage({ searchParams }: Props) {
  const raw = await searchParams;
  const filters = parseCatalogParams(raw);
  const [result, subs, counts] = await Promise.all([
    searchProducts(filters),
    getSubcategories(),
    getSubcategoryCounts(filters.gender),
  ]);
  const { title, eyebrow, sub } = describe(filters, subs);

  // Brze veze ka vrstama unutar trenutne kategorije
  const chipCategory = sub?.category ?? filters.category;
  const chips = subs.filter(
    (s) => (!chipCategory || s.category === chipCategory) && (counts.get(s.id) ?? 0) > 0,
  );
  const pol = filters.gender;

  return (
    <div className={cx('container', styles.page)}>
      <nav className={styles.breadcrumb} aria-label="Putanja">
        <Link href="/">Početna</Link>
        <span>/</span>
        <Link href="/prodavnica">Prodavnica</Link>
        {sub && (
          <>
            <span>/</span>
            <Link href={catalogHref({ kategorija: sub.category, pol })}>{CATEGORY_LABEL[sub.category]}</Link>
          </>
        )}
      </nav>

      <header className={styles.head}>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-title">{title}</h1>
        <p className="muted">
          {result.total} {plural(result.total, 'proizvod', 'proizvoda', 'proizvoda')}
        </p>
      </header>

      {!filters.q && (
        <div className={styles.chips}>
          <Link
            href={catalogHref({ kategorija: chipCategory, pol })}
            className={cx(styles.chip, !filters.subcategory && styles.chipActive)}
          >
            Sve
          </Link>
          {chips.map((s) => (
            <Link
              key={s.slug}
              href={catalogHref({ vrsta: s.slug, pol })}
              className={cx(styles.chip, filters.subcategory === s.slug && styles.chipActive)}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <CatalogControls
        filters={filters}
        facets={result.facets}
        total={result.total}
      >
        {result.products.length === 0 ? (
          <div className="empty-state">
            <h2>Nema pronađenih proizvoda</h2>
            <p>Pokušajte sa drugačijim filterima ili pojmom za pretragu.</p>
            <Link href="/prodavnica" className="btn btn-outline">
              Pogledajte sve proizvode
            </Link>
          </div>
        ) : (
          <>
            <ProductGrid products={result.products.map(toCardProduct)} columns={3} priorityCount={3} />
            {result.hasMore && (
              <LoadMore shown={result.products.length} total={result.total} nextPage={filters.page + 1} />
            )}
          </>
        )}
      </CatalogControls>
    </div>
  );
}
