import './Header.css';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Search, Menu, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { odecaKategorije, aksesoariKategorije } from '../data/constants';

// Sekcije u dropdown meniju (ODEĆA / AKSESOARI) — data-driven da se ne dupliraju blokovi
const MENU_SECTIONS = [
  { label: 'ODEĆA', category: 'odeca', items: odecaKategorije },
  { label: 'AKSESOARI', category: 'aksesoari', items: aksesoariKategorije },
];

const subPanelStyle = { position: 'static', boxShadow: 'none', background: '#fff', color: '#111', padding: '10px 0 10px 16px' };

// ŽENE/MUŠKARCI -> slug za ?gender= filter
const GENDER_SLUG = { 'ŽENE': 'zene', 'MUŠKARCI': 'muskarci' };

function Header() {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Burger meni state
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [openSub, setOpenSub] = useState(null); // dodaj pored ostalih useState

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?query=${encodeURIComponent(query.trim())}`);
      closeMenu();
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setActiveMain(null);
    setActiveSub(null);
    setOpenSub(null);
  };

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" && window.innerWidth <= 700);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="header ff-header">
      {/* Burger dugme i logo */}
      <div className="ff-header-row">
        {isMobile && (
          <button
            className="burger-btn"
            aria-label="Otvori meni"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={28} />
          </button>
        )}
        <Link href="/" className="ff-logo">
          FURLADA
        </Link>
      </div>

      {/* Navigacija */}
      <nav className={`ff-nav ${isMobile ? 'mobile' : ''} ${menuOpen ? 'open' : ''}`}>
        {/* Pretraga u mobilnom meniju — desktop search bar je sakriven na mobilnom */}
        {isMobile && (
          <form className="ff-mobile-search" onSubmit={handleSearch}>
            <div className="modern-search">
              <input
                type="text"
                placeholder="Pretraži artikle, kategoriju ili brend"
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="search-icon-btn" aria-label="Pretraži">
                <Search className="search-icon" size={20} />
              </button>
            </div>
          </form>
        )}
        {['ŽENE', 'MUŠKARCI'].map((main) => (
          <div
            className={`ff-nav-main${activeMain === main ? ' active' : ''}`}
            key={main}
            onMouseEnter={() => !isMobile && setActiveMain(main)}
            onMouseLeave={() => !isMobile && setActiveMain(null)}
          >
            <button
              className="ff-nav-btn"
              onClick={() => {
                if (isMobile) setActiveMain(activeMain === main ? null : main);
              }}
            >
              {main}
            </button>
            {/* Podmeni */}
            {(activeMain === main) && (
              <div className="ff-dropdown" style={isMobile ? { position: 'static', boxShadow: 'none', background: '#fff', color: '#111' } : {}}>
                {MENU_SECTIONS.map(({ label, category, items }) => (
                  <div
                    key={label}
                    className={`ff-dropdown-item${activeSub === label ? ' active' : ''}`}
                    onMouseEnter={() => !isMobile && setActiveSub(label)}
                    onClick={() => {
                      if (isMobile) {
                        setActiveSub(activeSub === label ? null : label);
                        setOpenSub(openSub === label ? null : label);
                      }
                    }}
                  >
                    <span
                      className="ff-dropdown-link"
                      style={{ display: 'inline-block', marginBottom: 6, cursor: 'pointer' }}
                      onClick={e => {
                        if (!isMobile) {
                          e.preventDefault();
                          setLocation(`/search?category=${category}&gender=${GENDER_SLUG[main]}`);
                          closeMenu();
                        }
                      }}
                    >
                      {label}
                    </span>
                    {(isMobile ? openSub === label : activeSub === label) && (
                      <div className="ff-dropdown-sub" style={isMobile ? subPanelStyle : {}}>
                        <div className="ff-dropdown-grid">
                          {items.map((k) => (
                            <Link
                              key={k}
                              href={`/search?subcategory=${encodeURIComponent(k)}&gender=${GENDER_SLUG[main]}`}
                              className="ff-dropdown-link"
                              onClick={closeMenu}
                            >
                              {k}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <form className="search-bar ff-search" onSubmit={handleSearch}>
        <div className="modern-search">
          <input
            type="text"
            placeholder="Pretraži artikle, kategoriju ili brend"
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-icon-btn">
            <Search className="search-icon" size={20} />
          </button>
        </div>
      </form>

      <div className="icon-group ff-icons">
        {isAdmin && <Link href="/admin"><span style={{ fontWeight: 600 }}>Admin</span></Link>}
        <Link href="/wishlist" className="ff-cart">
          <Heart size={22} />
          {wishlist.length > 0 && <span className="ff-cart-badge">{wishlist.length}</span>}
        </Link>
        <Link href="/profile"><User size={22} /></Link>
        <Link href="/cart" className="ff-cart">
          <ShoppingCart size={22} />
          {cartCount > 0 && <span className="ff-cart-badge">{cartCount}</span>}
        </Link>
      </div>
    </header>
  );
}

export default Header;