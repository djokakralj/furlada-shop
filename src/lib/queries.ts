import 'server-only';
import { and, arrayOverlaps, asc, desc, eq, gte, inArray, isNotNull, lte, ne, or, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/db';
import { products, subcategories, type Category, type Product, type Subcategory } from '@/db/schema';
import { PAGE_SIZE, SORT_OPTIONS, type SortOption } from '@/lib/constants';
import { sortSizes } from '@/lib/utils';

export type ProductWithSub = Product & { subcategory: Subcategory };

// Uklanja kvačice da bi "kosulja" pronašlo "košulja"
const FOLD_FROM = 'šđčćžŠĐČĆŽ';
const FOLD_TO = 'sdcczsdccz';
export const foldText = (s: string) =>
  s
    .toLowerCase()
    .split('')
    .map((ch) => {
      const i = FOLD_FROM.indexOf(ch);
      return i === -1 ? ch : FOLD_TO[i];
    })
    .join('');
const foldSql = (col: SQL | AnyColumn) =>
  sql`translate(lower(${col}), ${FOLD_FROM}, ${FOLD_TO})`;

export const getSubcategories = cache(async () => {
  return db.select().from(subcategories).orderBy(asc(subcategories.position), asc(subcategories.name));
});

// Broj aktivnih proizvoda po vrsti (i polu) — prazne vrste se ne prikazuju
// u meniju i katalogu, ali ostaju u admin panelu.
export const getSubcategoryCounts = cache(async (gender?: 'zene' | 'muskarci') => {
  const rows = await db
    .select({ id: products.subcategoryId, count: sql<number>`count(*)::int` })
    .from(products)
    .where(
      and(
        eq(products.active, true),
        gender ? or(eq(products.gender, gender), eq(products.gender, 'unisex')) : undefined,
      ),
    )
    .groupBy(products.subcategoryId);
  return new Map(rows.map((r) => [r.id, r.count]));
});

export async function getFeaturedProducts(limit = 8) {
  return db.query.products.findMany({
    where: and(eq(products.active, true), eq(products.featured, true)),
    with: { subcategory: true },
    orderBy: [desc(products.createdAt)],
    limit,
  });
}

export async function getNewestProducts(limit = 8) {
  return db.query.products.findMany({
    where: eq(products.active, true),
    with: { subcategory: true },
    orderBy: [desc(products.createdAt)],
    limit,
  });
}

export const getProductBySlug = cache(async (slug: string) => {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.active, true)),
    with: { subcategory: true },
  });
  return product ?? null;
});

export async function getRelatedProducts(product: Product, limit = 4) {
  return db.query.products.findMany({
    where: and(
      eq(products.active, true),
      eq(products.subcategoryId, product.subcategoryId),
      ne(products.id, product.id),
    ),
    with: { subcategory: true },
    orderBy: [desc(products.featured), desc(products.createdAt)],
    limit,
  });
}

export async function getProductsByIds(ids: string[]) {
  const valid = ids.filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  if (valid.length === 0) return [];
  return db.query.products.findMany({
    where: and(inArray(products.id, valid), eq(products.active, true)),
    with: { subcategory: true },
  });
}

// ─── Katalog ────────────────────────────────────────────────────────────────

export type { SortOption } from '@/lib/constants';

export type CatalogFilters = {
  category?: Category;
  subcategory?: string; // slug
  gender?: 'zene' | 'muskarci';
  q?: string;
  sale?: boolean;
  colors: string[];
  sizes: string[];
  min?: number;
  max?: number;
  sort: SortOption;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) =>
  (one(v) ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

export function parseCatalogParams(sp: SearchParams): CatalogFilters {
  const category = one(sp.kategorija);
  const gender = one(sp.pol);
  const sort = one(sp.sort);
  return {
    category: category === 'odeca' || category === 'aksesoari' ? category : undefined,
    subcategory: one(sp.vrsta) || undefined,
    gender: gender === 'zene' || gender === 'muskarci' ? gender : undefined,
    q: one(sp.q)?.trim().slice(0, 80) || undefined,
    sale: one(sp.akcija) === '1',
    colors: list(sp.boja),
    sizes: list(sp.velicina),
    min: num(sp.min),
    max: num(sp.max),
    sort: sort && sort in SORT_OPTIONS ? (sort as SortOption) : 'preporuceno',
    page: num(sp.strana) ?? 1,
  };
}

// Uslovi koji određuju "skup" proizvoda (kategorija, vrsta, pol, pretraga).
// Filteri boje/veličine/cene se primenjuju na taj skup, a facete (dostupne
// boje i veličine) se računaju iz njega — da se ne bi "zaključale" same.
function baseConditions(f: CatalogFilters) {
  const conds: SQL[] = [eq(products.active, true)];
  if (f.category) conds.push(eq(subcategories.category, f.category));
  if (f.subcategory) conds.push(eq(subcategories.slug, f.subcategory));
  if (f.gender) conds.push(or(eq(products.gender, f.gender), eq(products.gender, 'unisex'))!);
  if (f.sale) conds.push(isNotNull(products.compareAtPrice));
  if (f.q) {
    const words = foldText(f.q).split(/\s+/).filter(Boolean);
    for (const w of words) {
      const pattern = `%${w.replace(/[%_\\]/g, '\\$&')}%`;
      conds.push(
        or(
          sql`${foldSql(products.name)} like ${pattern}`,
          sql`${foldSql(products.description)} like ${pattern}`,
          sql`${foldSql(sql`coalesce(${products.brand}, '')`)} like ${pattern}`,
          sql`${foldSql(subcategories.name)} like ${pattern}`,
          sql`${foldSql(products.color)} like ${pattern}`,
        )!,
      );
    }
  }
  return conds;
}

export async function searchProducts(f: CatalogFilters) {
  const base = baseConditions(f);
  const filtered = [...base];
  if (f.colors.length) filtered.push(inArray(products.color, f.colors));
  if (f.sizes.length) filtered.push(arrayOverlaps(products.sizes, f.sizes));
  if (f.min) filtered.push(gte(products.price, f.min));
  if (f.max) filtered.push(lte(products.price, f.max));

  const orderBy =
    f.sort === 'najnovije'
      ? [desc(products.createdAt)]
      : f.sort === 'cena-rastuce'
        ? [asc(products.price), desc(products.createdAt)]
        : f.sort === 'cena-opadajuce'
          ? [desc(products.price), desc(products.createdAt)]
          : [desc(products.featured), desc(products.createdAt)];

  const limit = PAGE_SIZE * Math.min(f.page, 20);

  const joined = () =>
    db.select().from(products).innerJoin(subcategories, eq(products.subcategoryId, subcategories.id));

  const [rows, [{ total }], [facets], sizeRows] = await Promise.all([
    joined().where(and(...filtered)).orderBy(...orderBy).limit(limit),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(products)
      .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
      .where(and(...filtered)),
    db
      .select({
        colors: sql<string[]>`coalesce(array_agg(distinct ${products.color}), '{}')`,
        minPrice: sql<number | null>`min(${products.price})`,
        maxPrice: sql<number | null>`max(${products.price})`,
      })
      .from(products)
      .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
      .where(and(...base)),
    db
      .selectDistinct({ size: sql<string>`unnest(${products.sizes})` })
      .from(products)
      .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
      .where(and(...base)),
  ]);

  return {
    products: rows.map((r) => ({ ...r.products, subcategory: r.subcategories })),
    total,
    hasMore: total > rows.length,
    facets: {
      colors: facets.colors.filter(Boolean).sort((a, b) => a.localeCompare(b, 'sr')),
      sizes: sortSizes(sizeRows.map((r) => r.size)),
      minPrice: facets.minPrice,
      maxPrice: facets.maxPrice,
    },
  };
}
