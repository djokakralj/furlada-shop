import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { StatusBadge } from '@/components/order/order-status';
import type { OrderStatus } from '@/db/schema';
import { ADMIN_PAGE_SIZE, getAdminOrders } from '@/lib/admin-queries';
import { DELIVERY_LABEL, ORDER_STATUS_LABEL, ORDER_STATUSES } from '@/lib/constants';
import { requireAdminPage } from '@/lib/session';
import { cx, formatDate, formatPrice, orderNumber } from '@/lib/utils';
import { Pagination } from '../pagination';
import ui from '../ui.module.css';

export const metadata: Metadata = { title: 'Porudžbine' };

type Props = { searchParams: Promise<{ status?: string; q?: string; strana?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdminPage();
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const q = sp.q?.trim() || undefined;
  const page = Math.max(1, Number(sp.strana) || 1);
  const { orders, total, counts } = await getAdminOrders({ status, q, page });
  const all = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);

  const href = (params: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, q, ...params })) if (v) qs.set(k, v);
    const s = qs.toString();
    return s ? `/admin/porudzbine?${s}` : '/admin/porudzbine';
  };

  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>Porudžbine</h1>
          <p className={ui.subtitle}>Ukupno {all} porudžbina.</p>
        </div>
      </div>

      <section className={ui.card}>
        <div className={ui.toolbar}>
          <div className={ui.tabs}>
            <Link href={href({ status: undefined, strana: undefined })} className={cx(ui.tab, !status && ui.tabActive)}>
              Sve <em>{all}</em>
            </Link>
            {ORDER_STATUSES.map((s) => (
              <Link key={s} href={href({ status: s, strana: undefined })} className={cx(ui.tab, status === s && ui.tabActive)}>
                {ORDER_STATUS_LABEL[s]} <em>{counts[s] ?? 0}</em>
              </Link>
            ))}
          </div>
        </div>
        <div className={ui.toolbar}>
          <Form action="/admin/porudzbine" className={ui.search}>
            {status && <input type="hidden" name="status" value={status} />}
            <input
              name="q"
              defaultValue={q}
              className="input"
              placeholder="Pretraga: broj, ime, email ili telefon"
              type="search"
            />
          </Form>
          {q && (
            <Link href={href({ q: undefined })} className={ui.small}>
              Poništi pretragu
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <p className={ui.empty}>Nema porudžbina za izabrane filtere.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Broj</th>
                  <th>Datum</th>
                  <th>Kupac</th>
                  <th>Adresa dostave</th>
                  <th>Artikala</th>
                  <th>Status</th>
                  <th className={ui.num}>Iznos</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/porudzbine/${o.id}`} className={ui.rowLink}>
                        {orderNumber(o.number)}
                      </Link>
                    </td>
                    <td className={ui.small}>{formatDate(o.createdAt, true)}</td>
                    <td>
                      {o.firstName} {o.lastName}
                      <div className={ui.small}>{o.email}</div>
                    </td>
                    <td>
                      {o.street ? (
                        <>
                          {o.street} {o.streetNumber}
                          <div className={ui.small}>
                            {o.postalCode} {o.city}
                          </div>
                        </>
                      ) : (
                        <span className={ui.small}>{DELIVERY_LABEL[o.delivery]}</span>
                      )}
                    </td>
                    <td>{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={cx(ui.num, ui.strong)}>{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} total={total} pageSize={ADMIN_PAGE_SIZE} href={(p) => href({ strana: String(p) })} />
      </section>
    </>
  );
}
