import React, { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { db } from '../data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ORDER_STATUS_LABEL, DELIVERY_LABEL, PAYMENT_LABEL } from '../data/constants';
import './OrderPage.css';

function OrderPage() {
  const [, params] = useRoute('/order/:id');
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      const snap = await getDoc(doc(db, 'orders', String(id)));
      setOrder(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }
    if (id) fetchOrder();
  }, [id]);

  if (loading) return <div className="order-page"><p>Učitavanje porudžbine...</p></div>;

  if (!order) {
    return (
      <div className="order-page">
        <h1>Porudžbina nije pronađena</h1>
        <p>Proverite da li je link ispravan.</p>
        <Link href="/" className="order-back">← Početna</Link>
      </div>
    );
  }

  const status = order.status || 'primljena';
  const created = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('sr-RS') : '';

  return (
    <div className="order-page">
      <h1>Porudžbina #{order.id.slice(0, 8).toUpperCase()}</h1>
      <div className={`order-status order-status--${status}`}>
        Status: <strong>{ORDER_STATUS_LABEL[status] || status}</strong>
      </div>
      {created && <p className="order-date">Kreirana: {created}</p>}

      <div className="order-section">
        <h2>Artikli</h2>
        <ul className="order-items">
          {order.items?.map((item, idx) => (
            <li key={idx}>
              <span>
                {item.name}
                {item.size ? ` · ${item.size}` : ''}
                {item.color ? ` · ${item.color}` : ''}
                {` · ${item.quantity || 1} kom`}
              </span>
              <span>{(item.price * (item.quantity || 1)).toLocaleString('sr-RS')} RSD</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="order-section">
        <h2>Dostava</h2>
        <p>
          {order.customer?.name} {order.customer?.surname}<br />
          {order.customer?.address && (
            <>
              {order.customer.address.street} {order.customer.address.number}, {order.customer.address.postalCode} {order.customer.address.city}<br />
            </>
          )}
          {order.customer?.phone}
        </p>
        <p>Način dostave: {DELIVERY_LABEL[order.delivery] || order.delivery} · Plaćanje: {PAYMENT_LABEL[order.payment] || order.payment}</p>
      </div>

      <div className="order-total">
        <span>Ukupno</span>
        <span>{Number(order.total).toLocaleString('sr-RS')} RSD</span>
      </div>

      <Link href="/" className="order-back">← Nastavi kupovinu</Link>
    </div>
  );
}

export default OrderPage;
