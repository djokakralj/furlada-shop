import Image from 'next/image';
import Link from 'next/link';
import type { Order, OrderItem } from '@/db/schema';
import { DELIVERY_LABEL, PAYMENT_LABEL } from '@/lib/constants';
import { capitalize, formatPrice } from '@/lib/utils';
import styles from './order-details.module.css';

type ItemWithProduct = OrderItem & { product?: { slug: string } | null };

export function OrderItems({ items }: { items: ItemWithProduct[] }) {
  return (
    <ul className={styles.items}>
      {items.map((item) => (
        <li key={item.id}>
          <div className={styles.img}>{item.image && <Image src={item.image} alt="" fill sizes="72px" />}</div>
          <div className={styles.text}>
            {item.product ? (
              <Link href={`/proizvod/${item.product.slug}`} className={styles.name} prefetch={false}>
                {item.name}
              </Link>
            ) : (
              <span className={styles.name}>{item.name}</span>
            )}
            <small>
              {[item.size && `Veličina ${item.size}`, item.color && capitalize(item.color), `${item.quantity} kom.`]
                .filter(Boolean)
                .join(' · ')}
            </small>
          </div>
          <span className={styles.price}>{formatPrice(item.price * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

export function OrderTotals({ order }: { order: Order }) {
  return (
    <div className={styles.totals}>
      <div>
        <span>Međuzbir</span>
        <span>{formatPrice(order.itemsTotal)}</span>
      </div>
      <div>
        <span>Dostava</span>
        <span>{order.deliveryCost ? formatPrice(order.deliveryCost) : 'Besplatno'}</span>
      </div>
      <div className={styles.grand}>
        <span>Ukupno</span>
        <span>{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}

export function OrderCustomer({ order }: { order: Order }) {
  return (
    <div className={styles.customer}>
      <div>
        <h3>Kupac</h3>
        <p>
          {order.firstName} {order.lastName}
          <br />
          {order.email}
          <br />
          {order.phone}
        </p>
      </div>
      <div>
        <h3>{DELIVERY_LABEL[order.delivery]}</h3>
        {order.street ? (
          <p>
            {order.street} {order.streetNumber}
            <br />
            {order.postalCode} {order.city}
          </p>
        ) : (
          <p>Preuzimanje u radnji — javićemo vam kada je paket spreman.</p>
        )}
      </div>
      <div>
        <h3>Plaćanje</h3>
        <p>{PAYMENT_LABEL[order.payment]}</p>
      </div>
      {order.note && (
        <div>
          <h3>Napomena</h3>
          <p>{order.note}</p>
        </div>
      )}
    </div>
  );
}
