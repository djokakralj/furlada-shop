import './Header.css';
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Heart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header() {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const [active, setActive] = useState('zene');

  const handleSearch = (e) => {
  e.preventDefault();
  if (query.trim()) {
    setLocation(`/search?query=${encodeURIComponent(query.trim())}`);
  }
};
  const handleNav = (cat) => {
  setActive(cat);
  setLocation(`/search?category=${cat}`);
  window.location.reload(); // Dodato osvežavanje stranice
};

  return (
    <header className="header ff-header">
      
      <nav className="ff-nav">
        <button
          className={`ff-nav-btn${active === 'odeca' ? ' active' : ''}`}
          onClick={() => handleNav('odeca')}
        >
          ODECA
        </button>
        
        <button
          className={`ff-nav-btn${active === 'aksesoari' ? ' active' : ''}`}
          onClick={() => handleNav('aksesoari')}
        >
          AKSESOARI
        </button>
        
       
      </nav>

      <Link href="/" className="ff-logo">
        FURLADA
      </Link>

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
        {isAdmin && <Link href="/admin"><span style={{fontWeight:600}}>Admin</span></Link>}
        <Link href="/profile"><User size={22} /></Link>
        <Link href="/cart" className="ff-cart">
          <ShoppingCart size={22} />
          <span className="ff-cart-badge">0</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;