import { ArrowLeft, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrderCustomer, OrderItems, OrderTotals } from '@/components/order/order-details';
import { OrderTimeline } from '@/components/order/order-status';
import { getAdminOrder } from '@/lib/admin-queries';
import { DELIVERY_LABEL } from '@/lib/constants';
import { requireAdminPage } from '@/lib/session';
import { formatDate, orderNumber } from '@/lib/utils';
import ui from '../../ui.module.css';
import { StatusControl } from './status-control';
import styles from './order-admin.module.css';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await requireAdminPage();
  const order = await getAdminOrder((await params).id);
  return { title: order ? `Porudžbina ${orderNumber(order.number)}` : 'Porudžbina' };
}

export default async function AdminOrderPage({ params }: Props) {
  await requireAdminPage();
  const order = await getAdminOrder((await params).id);
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/porudzbine" className={ui.back}>
        <ArrowLeft size={14} /> Sve porudžbine
      </Link>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>Porudžbina {orderNumber(order.number)}</h1>
          <p className={ui.subtitle}>
            {formatDate(order.createdAt, true)} · {order.userId ? 'registrovan kupac' : 'kupovina bez naloga'}
          </p>
        </div>
        <Link href={`/porudzbina/${order.id}`} className="btn btn-outline btn-sm" target="_blank">
          Stranica za kupca <ExternalLink size={13} />
        </Link>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={ui.card}>
            <div className={ui.cardBody}>
              <OrderTimeline status={order.status} />
            </div>
          </section>
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2>Artikli</h2>
            </div>
            <div className={ui.cardBody}>
              <OrderItems items={order.items} />
              <OrderTotals order={order} />
            </div>
          </section>
          <section className={ui.card}>
            <div className={ui.cardBody}>
              <OrderCustomer order={order} />
            </div>
          </section>
        </div>

        <aside className={styles.side}>
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2>Status</h2>
            </div>
            <div className={ui.cardBody}>
              <StatusControl orderId={order.id} status={order.status} />
            </div>
          </section>
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2>Dostava</h2>
              <span className={ui.small}>{DELIVERY_LABEL[order.delivery]}</span>
            </div>
            <div className={styles.contact}>
              <p className={styles.address}>
                <strong>
                  {order.firstName} {order.lastName}
                </strong>
                {order.street ? (
                  <>
                    <br />
                    {order.street} {order.streetNumber}
                    <br />
                    {order.postalCode} {order.city}
                  </>
                ) : (
                  <>
                    <br />
                    Lično preuzimanje — bez adrese
                  </>
                )}
              </p>
              {order.street && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${order.street} ${order.streetNumber}, ${order.postalCode} ${order.city}, Srbija`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={15} /> Otvori na mapi
                </a>
              )}
              {order.note && (
                <p className={styles.note}>
                  <strong>Napomena:</strong> {order.note}
                </p>
              )}
            </div>
          </section>
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2>Kontakt</h2>
            </div>
            <div className={styles.contact}>
              <a href={`tel:${order.phone.replace(/[^0-9+]/g, '')}`}>
                <Phone size={15} /> {order.phone}
              </a>
              <a href={`mailto:${order.email}?subject=Porudžbina ${orderNumber(order.number)}`}>
                <Mail size={15} /> {order.email}
              </a>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
