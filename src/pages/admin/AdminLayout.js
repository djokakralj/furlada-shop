import React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Package, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const NAV_ITEMS = [
  { href: '/admin', label: 'Pregled', Icon: LayoutDashboard },
  { href: '/admin/proizvodi', label: 'Proizvodi', Icon: Package },
  { href: '/admin/porudzbine', label: 'Porudžbine', Icon: ShoppingBag },
  { href: '/admin/atributi', label: 'Atributi', Icon: SlidersHorizontal },
];

// Zajednički okvir za sve admin stranice: guard + sidebar navigacija
function AdminLayout({ children }) {
  const { isAdmin, loading: authLoading } = useAuth();
  const [location] = useLocation();

  if (authLoading) {
    return <div className="admin-shell"><p className="admin-loading">Učitavanje...</p></div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <h1>Pristup odbijen</h1>
        <p>Ova stranica je dostupna samo administratorima.</p>
        <Link href="/" className="admin-denied-btn">Nazad na početnu</Link>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin panel</div>
        <nav className="admin-nav">
          {NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link${location === href ? ' active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}

export default AdminLayout;
