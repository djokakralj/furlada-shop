import { CircleCheck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderCustomer, OrderItems, OrderTotals } from '@/components/order/order-details';
import { OrderTimeline, StatusBadge } from '@/components/order/order-status';
import { getOrderForViewer } from '@/lib/orders';
import { getCurrentUser } from '@/lib/session';
import { cx, formatDate, orderNumber } from '@/lib/utils';
import styles from './order.module.css';

export const metadata: Metadata = { title: 'Porudžbina', robots: { index: false } };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nova?: string }>;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { nova }] = await Promise.all([params, searchParams]);
  const order = await getOrderForViewer(id);
  if (!order) notFound();
  const viewer = await getCurrentUser();
  const isNew = nova === '1';

  return (
    <div className={cx('container-narrow', 'page')}>
      {isNew && (
        <div className={styles.thanks}>
          <CircleCheck size={44} strokeWidth={1.2} />
          <h1>Hvala na porudžbini!</h1>
          <p>
            Porudžbina <strong>{orderNumber(order.number)}</strong> je primljena. Potvrdu smo poslali na{' '}
            <strong>{order.email}</strong>, a uskoro ćemo vas kontaktirati radi potvrde isporuke.
          </p>
          {!order.userId && (
            <p className={styles.save}>
              Sačuvajte ovu stranicu — preko nje možete pratiti status porudžbine.
            </p>
          )}
        </div>
      )}

      <div className={styles.head}>
        <div>
          <span className="eyebrow">Porudžbina</span>
          <h2 className={styles.number}>{orderNumber(order.number)}</h2>
          <p className="muted">{formatDate(order.createdAt, true)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className={styles.card}>
        <OrderTimeline status={order.status} />
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Artikli</h3>
        <OrderItems items={order.items} />
        <OrderTotals order={order} />
      </div>

      <div className={styles.card}>
        <OrderCustomer order={order} />
      </div>

      <div className={styles.actions}>
        <Link href="/prodavnica" className="btn">
          Nastavite kupovinu
        </Link>
        {viewer && (
          <Link href="/nalog" className="btn btn-outline">
            Moje porudžbine
          </Link>
        )}
      </div>
    </div>
  );
}
