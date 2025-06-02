import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '../context/CartContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import './SearchResults.css';

function SearchResults() {
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    price: { min: 0, max: 1000000 },
    color: '',
    size: '',
  });
  const [availableColors, setAvailableColors] = useState([]);
  const { addToCart } = useCart();

  // Čitanje query parametara iz URL-a
  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get('category')?.toLowerCase() || '';
  const queryParam = searchParams.get('query')?.toLowerCase() || '';

  // Mapa za prevođenje boja
  const colorTranslationMap = {
    crvena: '#f2111c',
    plava: '#13187d',
    zelena: '#7fc24b',
    žuta: '#f2ff00',
    narandžasta: '#ff8000',
    ljubičasta: '#800080',
    bela: '#ffffff',
    crna: '#000000',
    siva: '#aba9a9',
    roze: '#f76cf7',
    braon: '#914038',
    zlatna: '#ffd700',
    srebrna: '#c0c0c0',
    maslinasta: '#59704c',
    jeans: '#5d6d7e',
    tirkizna: '#48d1cc',
  };

  useEffect(() => {
    async function fetchAndFilterProducts() {
      const db = getFirestore();
      const productsRef = collection(db, 'products');
      let q = query(productsRef);
      if (categoryParam) {
        q = query(q, where('category', '==', categoryParam));
      }

      // Dohvatanje proizvoda iz Firestore-a
      const querySnapshot = await getDocs(q);
      const allProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Dinamičko izvlačenje dostupnih boja
      const colorsSet = new Set();
      allProducts.forEach((product) => {
        if (product.color) {
          colorsSet.add(product.color);
        }
      });
      setAvailableColors(Array.from(colorsSet));

      // Filtriranje na osnovu query parametara
      const results = allProducts.filter((product) => {
        const matchesQuery =
          product.name.toLowerCase().includes(queryParam) ||
          product.description?.toLowerCase().includes(queryParam) ||
          product.brand?.toLowerCase().includes(queryParam);
        return matchesQuery;
      });

      // Filtriranje na osnovu cena, boje i (ako nije aksesoari) veličine
      const filteredResults = results.filter((product) => {
        const matchesPrice =
          product.price >= filters.price.min && product.price <= filters.price.max;
        const matchesColor = filters.color
          ? product.color?.toLowerCase() === filters.color.toLowerCase()
          : true;
        const matchesSize = categoryParam === 'aksesoari'
          ? true // Kod aksesoara ne proveravamo veličinu
          : filters.size
            ? Array.isArray(product.sizes) && product.sizes.some(
                (size) => size.toLowerCase() === filters.size.toLowerCase()
              )
            : true;
        return matchesPrice && matchesColor && matchesSize;
      });

      setFiltered(filteredResults);
      setLoading(false);
    }
    fetchAndFilterProducts();
  }, [window.location.search, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: name === 'price' ? JSON.parse(value) : value,
    }));
  };

  return (
    <div className="search-page">
      <aside className="filters">
        <h3>Filteri</h3>

        {/* Filter za cenu */}
        <div className="filter-group">
          <label htmlFor="price">Cena:</label>
          <input
            type="range"
            id="price"
            name="price"
            min="0"
            max="50000"
            step="1000"
            onChange={(e) =>
              setFilters((prevFilters) => ({
                ...prevFilters,
                price: { ...prevFilters.price, max: Number(e.target.value) },
              }))
            }
          />
          <div className="price-values">
            <span>{filters.price.min} RSD</span>
            <span>{filters.price.max} RSD</span>
          </div>
        </div>

        {/* Filter za boje */}
        <div className="filter-group">
          <label>Boja:</label>
          <div className="color-options">
            {availableColors.map((color, index) => {
              const translatedColor = colorTranslationMap[color.toLowerCase()] || color;
              return (
                <button
                  key={index}
                  className={`color-button ${
                    filters.color === color ? "active" : ""
                  }`}
                  style={{ backgroundColor: translatedColor }}
                  onClick={() =>
                    setFilters((prevFilters) => ({
                      ...prevFilters,
                      color: filters.color === color ? "" : color,
                    }))
                  }
                ></button>
              );
            })}
          </div>
        </div>

        {/* Filter za veličine */}
        {categoryParam !== "aksesoari" && (
          <div className="filter-group">
            <label>Veličina:</label>
            <div className="size-options">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  className={`size-button ${
                    filters.size === size ? "active" : ""
                  }`}
                  onClick={() =>
                    setFilters((prevFilters) => ({
                      ...prevFilters,
                      size: filters.size === size ? "" : size,
                    }))
                  }
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

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
                </Link>
                <div className="product-card-content">
                  <h2>{product.name}</h2>
                  <span>{product.price} RSD</span>
                </div>
                <button className="add-to-cart" onClick={() => addToCart(product)}>
                  Dodaj u korpu
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;