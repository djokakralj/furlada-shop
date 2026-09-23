import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../data/firebase';
import { ORDER_STATUS_LABEL } from '../../data/constants';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      const [productsSnap, ordersSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
      ]);
      const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      setStats({
        products: productsSnap.size,
        orders: orders.length,
        newOrders: orders.filter(o => !o.status || o.status === 'primljena').length,
        revenue: orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
      });
      setRecentOrders(orders.slice(0, 5));
    }
    fetchStats().catch(err => console.error('Greška pri učitavanju pregleda:', err));
  }, []);

  if (!stats) return <p className="admin-loading">Učitavanje...</p>;

  const cards = [
    { label: 'Proizvoda u ponudi', value: stats.products, href: '/admin/proizvodi' },
    { label: 'Ukupno porudžbina', value: stats.orders, href: '/admin/porudzbine' },
    { label: 'Nove porudžbine', value: stats.newOrders, href: '/admin/porudzbine' },
    { label: 'Ukupan promet', value: `${stats.revenue.toLocaleString('sr-RS')} RSD`, href: '/admin/porudzbine' },
  ];

  return (
    <>
      <h1 className="admin-page-title">Pregled</h1>

      <div className="admin-stat-grid">
        {cards.map(({ label, value, href }) => (
          <Link key={label} href={href} className="admin-stat-card">
            <span className="admin-stat-value">{value}</span>
            <span className="admin-stat-label">{label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Poslednje porudžbine</h2>
          <Link href="/admin/porudzbine" className="admin-card-link">Sve porudžbine →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="admin-empty">Još uvek nema porudžbina.</p>
        ) : (
          <ul className="admin-recent-list">
            {recentOrders.map(o => {
              const status = o.status || 'primljena';
              return (
                <li key={o.id} className="admin-recent-row">
                  <span className="admin-recent-id">#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span className="admin-recent-name">
                    {o.customer?.name} {o.customer?.surname}
                  </span>
                  <span className={`admin-status-badge admin-status-badge--${status}`}>
                    {ORDER_STATUS_LABEL[status] || status}
                  </span>
                  <span className="admin-recent-total">
                    {Number(o.total).toLocaleString('sr-RS')} RSD
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;
