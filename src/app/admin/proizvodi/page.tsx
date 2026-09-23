import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { ADMIN_PAGE_SIZE, getAdminProducts } from '@/lib/admin-queries';
import { toCardProduct } from '@/lib/product';
import { getSubcategories } from '@/lib/queries';
import { requireAdminPage } from '@/lib/session';
import { cx } from '@/lib/utils';
import { Pagination } from '../pagination';
import ui from '../ui.module.css';
import { ProductRows } from './product-rows';

export const metadata: Metadata = { title: 'Proizvodi' };

const STATUS = { aktivni: 'Aktivni', skriveni: 'Skriveni', izdvojeni: 'Izdvojeni', akcija: 'Na akciji' } as const;
type Status = keyof typeof STATUS;

type Props = { searchParams: Promise<{ q?: string; vrsta?: string; status?: string; strana?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = sp.q?.trim() || undefined;
  const vrsta = Number(sp.vrsta) || undefined;
  const status = sp.status && sp.status in STATUS ? (sp.status as Status) : undefined;
  const page = Math.max(1, Number(sp.strana) || 1);

  const [{ products, total }, subs] = await Promise.all([
    getAdminProducts({ q, subcategoryId: vrsta, status, page }),
    getSubcategories(),
  ]);

  const href = (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { q, vrsta: vrsta?.toString(), status, ...params };
    for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
    const s = qs.toString();
    return s ? `/admin/proizvodi?${s}` : '/admin/proizvodi';
  };

  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>Proizvodi</h1>
          <p className={ui.subtitle}>{total} proizvoda za izabrane filtere.</p>
        </div>
        <Link href="/admin/proizvodi/novi" className="btn btn-sm">
          <Plus size={15} /> Novi proizvod
        </Link>
      </div>

      <section className={ui.card}>
        <div className={ui.toolbar}>
          <div className={ui.tabs}>
            <Link href={href({ status: undefined, strana: undefined })} className={cx(ui.tab, !status && ui.tabActive)}>
              Svi
            </Link>
            {(Object.keys(STATUS) as Status[]).map((s) => (
              <Link key={s} href={href({ status: s, strana: undefined })} className={cx(ui.tab, status === s && ui.tabActive)}>
                {STATUS[s]}
              </Link>
            ))}
          </div>
        </div>
        <Form action="/admin/proizvodi" className={ui.toolbar}>
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} className={cx('input', ui.search)} placeholder="Pretraga po nazivu" type="search" />
          <select name="vrsta" defaultValue={vrsta ?? ''} className="select" style={{ width: 'auto' }}>
            <option value="">Sve vrste</option>
            {subs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-outline btn-sm">
            Primeni
          </button>
          {(q || vrsta) && (
            <Link href={href({ q: undefined, vrsta: undefined, strana: undefined })} className={ui.small}>
              Poništi
            </Link>
          )}
        </Form>

        {products.length === 0 ? (
          <p className={ui.empty}>Nema proizvoda za izabrane filtere.</p>
        ) : (
          <ProductRows
            products={products.map((p) => ({
              ...toCardProduct(p),
              active: p.active,
              featured: p.featured,
            }))}
          />
        )}
        <Pagination page={page} total={total} pageSize={ADMIN_PAGE_SIZE} href={(p) => href({ strana: String(p) })} />
      </section>
    </>
  );
}
