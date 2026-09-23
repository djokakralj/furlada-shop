import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { ExternalLink } from 'lucide-react';
import { db } from '../../data/firebase';
import { useToast } from '../../components/Toast';
import { ORDER_STATUS_LABEL, DELIVERY_LABEL, PAYMENT_LABEL } from '../../data/constants';

function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('sve');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Greška pri učitavanju porudžbina:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleChangeStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      showToast(`Status porudžbine promenjen u "${ORDER_STATUS_LABEL[newStatus]}".`);
    } catch (error) {
      console.error('Greška pri promeni statusa:', error);
      showToast('Greška pri promeni statusa.', 'error');
    }
  };

  const filteredOrders = statusFilter === 'sve'
    ? orders
    : orders.filter(o => (o.status || 'primljena') === statusFilter);

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Porudžbine</h1>
        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="sve">Sve porudžbine ({orders.length})</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label} ({orders.filter(o => (o.status || 'primljena') === value).length})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="admin-loading">Učitavanje...</p>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-card">
          <p className="admin-empty">
            {statusFilter === 'sve' ? 'Još uvek nema porudžbina.' : 'Nema porudžbina sa ovim statusom.'}
          </p>
        </div>
      ) : (
        <div className="admin-orders-grid">
          {filteredOrders.map(order => {
            const status = order.status || 'primljena';
            const created = order.createdAt?.toDate
              ? order.createdAt.toDate().toLocaleString('sr-RS', { dateStyle: 'short', timeStyle: 'short' })
              : '';
            return (
              <div key={order.id} className="admin-order-card">
                <div className="admin-order-top">
                  <div>
                    <Link href={`/order/${order.id}`} className="admin-order-id">
                      #{order.id.slice(0, 8).toUpperCase()}
                      <ExternalLink size={12} />
                    </Link>
                    {created && <span className="admin-order-date">{created}</span>}
                  </div>
                  <span className={`admin-status-badge admin-status-badge--${status}`}>
                    {ORDER_STATUS_LABEL[status] || status}
                  </span>
                </div>

                <div className="admin-order-customer">
                  <strong>{order.customer?.name} {order.customer?.surname}</strong>
                  <span>{order.customer?.email} · {order.customer?.phone}</span>
                  {order.customer?.address && (
                    <span>
                      {order.customer.address.street} {order.customer.address.number},{' '}
                      {order.customer.address.postalCode} {order.customer.address.city}
                    </span>
                  )}
                  <span>
                    {DELIVERY_LABEL[order.delivery] || order.delivery} · {PAYMENT_LABEL[order.payment] || order.payment}
                  </span>
                </div>

                <ul className="admin-order-items">
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      <span>
                        {item.name}
                        {item.size ? ` · ${item.size}` : ''}
                        {item.color ? ` · ${item.color}` : ''}
                        {` × ${item.quantity || 1}`}
                      </span>
                      <span>{(item.price * (item.quantity || 1)).toLocaleString('sr-RS')} RSD</span>
                    </li>
                  ))}
                </ul>

                <div className="admin-order-bottom">
                  <span className="admin-order-total">
                    Ukupno: <strong>{Number(order.total).toLocaleString('sr-RS')} RSD</strong>
                  </span>
                  <select
                    className="admin-filter-select"
                    value={status}
                    onChange={e => handleChangeStatus(order.id, e.target.value)}
                  >
                    {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default AdminOrders;
