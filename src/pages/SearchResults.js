import React, { useEffect, useState } from 'react';
import { getProducts } from '../data/products';

function SearchResults() {
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndFilterProducts() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const query = searchParams.get('query')?.toLowerCase() || '';

        console.log('Pretraga:', query); // DEBUG

        const allProducts = await getProducts();
        const results = allProducts.filter((product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
        );

        setFiltered(results);
        setLoading(false);
      } catch (err) {
        console.error('Greška pri pretrazi:', err);
        setFiltered([]);
        setLoading(false);
      }
    }

    fetchAndFilterProducts();
  }, [window.location.search]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Rezultati pretrage</h2>
      {loading ? (
        <p>Učitavanje...</p>
      ) : filtered.length === 0 ? (
        <p>Nema pronađenih proizvoda.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="border p-2 rounded">
              <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
              <h3 className="text-sm font-semibold mt-2">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.price} RSD</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
