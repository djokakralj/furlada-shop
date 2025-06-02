import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { FaInstagram,FaArrowRight } from 'react-icons/fa';
import { getProducts } from '../data/products';
import { Link } from 'wouter';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productList = await getProducts();
        setProducts(productList);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <p>Učitavanje proizvoda...</p>;
  if (error) return <p>Greška: {error.message}</p>;

 return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-image" />
        <div className="hero-content">
          <h1>Nova Sezonska<br />Kolekcija</h1>
          <p>Istražite najnovije trendove i stilove</p>
          <Link href="/search">
            <button className="hero-btn">
              Pogledaj kolekciju
              <FaArrowRight style={{ marginLeft: 8 }} />
            </button>
          </Link>
        </div>
      </section>

      {/* KATEGORIJE */}
       <section className="categories-section">
        <div className="category-grid">
          <Link href="/search?category=odeca" className="category-card clothes">
            <div className="category-content">
              <h3>Odeća</h3>
              <span className="category-link">Pogledaj kolekciju</span>
            </div>
          </Link>
          <Link href="/search?category=aksesoari" className="category-card accessories">
            <div className="category-content">
              <h3>Aksesoari</h3>
              <span className="category-link">Pogledaj kolekciju</span>
            </div>
          </Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Izdvajamo iz ponude</h2>
          <Link href="/search" className="view-all">Pogledaj sve</Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
        {/*
      {/* PROMO BANNER *
      <section className="promo-section">
        <div className="promo-content">
          <h2>Letnja rasprodaja</h2>
          <p>Do 40% popusta na odabrane artikle</p>
          <Link href="/search?cat=outlet">
            <button className="promo-btn">Istraži ponudu</button>
          </Link>
        </div>
      </section>
        */}
      
    </div>
  );
};

export default HomePage;