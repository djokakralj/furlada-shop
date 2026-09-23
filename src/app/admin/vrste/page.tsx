import type { Metadata } from 'next';
import { getSubcategoriesWithCounts } from '@/lib/admin-queries';
import { requireAdminPage } from '@/lib/session';
import ui from '../ui.module.css';
import { SubcategoryManager } from './subcategory-manager';

export const metadata: Metadata = { title: 'Vrste i atributi' };

export default async function SubcategoriesPage() {
  await requireAdminPage();
  const rows = await getSubcategoriesWithCounts();
  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>Vrste i atributi</h1>
          <p className={ui.subtitle}>
            Vrste proizvoda određuju meni na sajtu i koje veličine i boje se nude pri dodavanju proizvoda. Vrste bez
            aktivnih proizvoda se ne prikazuju kupcima.
          </p>
        </div>
      </div>
      <SubcategoryManager rows={rows.map((r) => ({ ...r.sub, productCount: r.productCount }))} />
    </>
  );
}
