import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGrid } from '@/components/product/product-grid';
import { CATEGORY_LABEL } from '@/lib/constants';
import { toCardProduct } from '@/lib/product';
import { getProductBySlug, getRelatedProducts } from '@/lib/queries';
import { cx } from '@/lib/utils';
import { Gallery } from './gallery';
import { ProductInfo } from './product-info';
import styles from './product.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: 'Proizvod nije pronađen' };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);

  const sub = product.subcategory;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    color: product.color,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'RSD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className={cx('container', styles.page)}>
        <nav className={styles.breadcrumb} aria-label="Putanja">
          <Link href="/">Početna</Link>
          <span>/</span>
          <Link href={`/prodavnica?kategorija=${sub.category}`}>{CATEGORY_LABEL[sub.category]}</Link>
          <span>/</span>
          <Link href={`/prodavnica?vrsta=${sub.slug}`}>{sub.name}</Link>
          <span>/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className={styles.layout}>
          <Gallery images={product.images} name={product.name} />
          <ProductInfo
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              description: product.description,
              details: product.details,
              color: product.color,
              sizes: product.sizes,
              image: product.images[0] ?? null,
              subcategory: sub.name,
            }}
          />
        </div>
      </div>

      {related.length > 0 && (
        <section className={cx('container', styles.related)}>
          <h2>Možda će vam se dopasti</h2>
          <ProductGrid products={related.map(toCardProduct)} />
        </section>
      )}
    </>
  );
}
