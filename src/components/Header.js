import './Header.css';
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, User, Heart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Header() {
  const [query, setQuery] = useState('');
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategorySelect = (e) => {
    const selectedCategory = e.target.value;
    if (selectedCategory) {
      setLocation(`/search?query=${encodeURIComponent(selectedCategory)}`);
    }
    window.location.reload();
  };

  return (
    <header className="header">
      <Link href="/" className="logo">Furlada</Link>

      {/* Dropdown za kategorije */}
      <select className="category-dropdown" onChange={handleCategorySelect} defaultValue="">
        <option value="" disabled>Izaberi kategoriju</option>
        <option value="majica">Majice</option>
        <option value="pantalone">Pantalone</option>
        <option value="jakna">Jakne</option>
        <option value="carape">Čarape</option>
        {/* Dodaj još kategorija ako želiš */}
      </select>

      <form className="search-bar" onSubmit={handleSearch}>
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search item, category or brand"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="search-button">SEARCH</button>
      </form>

      <div className="icon-group">
        {isAdmin && <Link href="/admin"><span style={{fontWeight:600}}>Admin</span></Link>}
        <Link href="/profile"><User size={20} /></Link>
        <Link href="/wishlist"><Heart size={20} /></Link>
        <Link href="/cart"><ShoppingCart size={20} /></Link>
      </div>
    </header>
  );
}

export default Header;