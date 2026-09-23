import { Package } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from '@/components/order/order-status';
import { getUserOrders } from '@/lib/orders';
import { requireUser } from '@/lib/session';
import { formatDate, formatPrice, orderNumber, plural } from '@/lib/utils';
import styles from './account.module.css';

export const metadata: Metadata = { title: 'Moje porudžbine' };

export default async function AccountOrdersPage({ searchParams }: { searchParams: Promise<{ dobrodosli?: string }> }) {
  const user = await requireUser();
  const [orders, { dobrodosli }] = await Promise.all([getUserOrders(user.id), searchParams]);

  return (
    <>
      {dobrodosli && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          Nalog je kreiran. Dobro došli u Furladu! Poslali smo vam email za potvrdu adrese.
        </div>
      )}
      <h2 className={styles.sectionTitle}>Porudžbine</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <Package size={40} strokeWidth={1} />
          <p>Još uvek nemate porudžbina.</p>
          <Link href="/prodavnica" className="btn">
            Počnite kupovinu
          </Link>
        </div>
      ) : (
        <ul className={styles.orders}>
          {orders.map((o) => {
            const count = o.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <li key={o.id}>
                <Link href={`/porudzbina/${o.id}`} className={styles.order}>
                  <div className={styles.orderTop}>
                    <div>
                      <strong>{orderNumber(o.number)}</strong>
                      <span className="muted">{formatDate(o.createdAt)}</span>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className={styles.orderBottom}>
                    <div className={styles.thumbs}>
                      {o.items.slice(0, 4).map((i) => (
                        <div key={i.id} className={styles.thumb}>
                          {i.image && <Image src={i.image} alt="" fill sizes="48px" />}
                        </div>
                      ))}
                      {o.items.length > 4 && <span className={styles.more}>+{o.items.length - 4}</span>}
                    </div>
                    <div className={styles.orderTotal}>
                      <span className="muted">
                        {count} {plural(count, 'artikal', 'artikla', 'artikala')}
                      </span>
                      <strong>{formatPrice(o.total)}</strong>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
