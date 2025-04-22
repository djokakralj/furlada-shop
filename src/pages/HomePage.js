import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { getProducts } from '../data/products'; // Import funkcije za dobijanje proizvoda
import { Link } from 'wouter'; // Ispravan import za Wouter

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productList = await getProducts(); // Učitavanje proizvoda iz Firestore-a
        setProducts(productList);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error('Failed to fetch products:', err);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="home-page">
      <div className="banner">
        <h1>Nova kolekcija je stigla!</h1>
        <p>Otkrijte najbolje komade za ovu sezonu.</p>
        <button className="shop-now">Pogledaj kolekciju</button>
      </div>

      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <Link href={`/product/${product.id}`}> {/* Link promenjen za Wouter */}
              <img src={product.imageUrl} alt={product.name} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <span>{product.price} RSD</span>
            </Link>
            <button onClick={() => addToCart(product)}>Dodaj u korpu</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
