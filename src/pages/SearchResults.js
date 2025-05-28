import React, { useEffect, useState } from 'react';
import { getProducts } from '../data/products';
import { Link } from 'wouter';
import { useCart } from '../context/CartContext';
import './HomePage.css';

function SearchResults() {
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchAndFilterProducts() {
      const searchParams = new URLSearchParams(window.location.search);
      const query = searchParams.get('query')?.toLowerCase() || '';

      const allProducts = await getProducts();
      const results = allProducts.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );

      setFiltered(results);
      setLoading(false);
    }

    fetchAndFilterProducts();
  }, [window.location.search]);

  return (
    <div className="home-page">
      <h2 className="text-xl font-bold mb-4 text-center">Rezultati pretrage</h2>

      {loading ? (
        <p className="text-center">Učitavanje...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center">Nema pronađenih proizvoda.</p>
      ) : (
        <div className="product-list">
          {filtered.map((product) => (
            <div key={product.id} className="product-card">
              <Link href={`/product/${String(product.id)}`}>
                <img src={product.imageUrl} alt={product.name} />
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <span>{product.price} RSD</span>
              </Link>
              <button
                className="add-to-cart"
                onClick={() => addToCart(product)}
              >
                Dodaj u korpu
              </button>
            </div>

          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
