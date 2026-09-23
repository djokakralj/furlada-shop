import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSubcategories } from '@/lib/queries';
import { requireAdminPage } from '@/lib/session';
import ui from '../../ui.module.css';
import { ProductForm } from '../product-form';

export const metadata: Metadata = { title: 'Novi proizvod' };

export default async function NewProductPage() {
  await requireAdminPage();
  const subs = await getSubcategories();
  return (
    <>
      <Link href="/admin/proizvodi" className={ui.back}>
        <ArrowLeft size={14} /> Proizvodi
      </Link>
      <div className={ui.pageHead}>
        <h1 className={ui.title}>Novi proizvod</h1>
      </div>
      <ProductForm id={null} subcategories={subs} />
    </>
  );
}
