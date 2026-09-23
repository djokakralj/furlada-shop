import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/lib/admin-queries';
import { getSubcategories } from '@/lib/queries';
import { requireAdminPage } from '@/lib/session';
import ui from '../../ui.module.css';
import { ProductForm } from '../product-form';

export const metadata: Metadata = { title: 'Izmena proizvoda' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const [product, subs] = await Promise.all([getAdminProduct(id), getSubcategories()]);
  if (!product) notFound();

  return (
    <>
      <Link href="/admin/proizvodi" className={ui.back}>
        <ArrowLeft size={14} /> Proizvodi
      </Link>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>{product.name}</h1>
          <p className={ui.subtitle}>Šifra: {product.id}</p>
        </div>
        {product.active && (
          <Link href={`/proizvod/${product.slug}`} target="_blank" className="btn btn-outline btn-sm">
            Pogledaj na sajtu <ExternalLink size={13} />
          </Link>
        )}
      </div>
      <ProductForm
        key={product.updatedAt.toISOString()}
        id={product.id}
        subcategories={subs}
        initial={{
          name: product.name,
          description: product.description,
          details: product.details ?? '',
          brand: product.brand ?? '',
          price: String(product.price),
          compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : '',
          subcategoryId: String(product.subcategoryId),
          gender: product.gender,
          color: product.color,
          sizes: product.sizes,
          images: product.images,
          featured: product.featured,
          active: product.active,
        }}
      />
    </>
  );
}
