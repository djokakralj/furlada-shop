import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { colorTranslationMap, SIZE_ORDER } from '../data/constants';
import ProductCard from '../components/ProductCard';
import './SearchResults.css';

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button
        className={`filter-section-header${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span>{title}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

function SearchResults() {
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '', color: '', size: '' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const searchParams = new URLSearchParams(window.location.search);
  const categoryParam = searchParams.get('category')?.toLowerCase() || '';
  const subcategoryParam = searchParams.get('subcategory')?.toLowerCase() || '';
  const genderParam = searchParams.get('gender')?.toLowerCase() || '';
  const queryParam = searchParams.get('query')?.toLowerCase() || '';

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  // Fetch from Firestore — only when category/query changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const db = getFirestore();
      let q = query(collection(db, 'products'));
      if (categoryParam) q = query(q, where('category', '==', categoryParam));

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const results = products.filter(p => {
        // Filter po podkategoriji (npr. "Haljine") — case-insensitive
        if (subcategoryParam && p.subcategory?.toLowerCase() !== subcategoryParam) {
          return false;
        }
        // Filter po polu — proizvodi bez gendera ili 'unisex' se prikazuju svuda
        if (genderParam) {
          const g = p.gender?.toLowerCase();
          if (g && g !== 'unisex' && g !== genderParam) return false;
        }
        if (!queryParam) return true;
        return (
          p.name?.toLowerCase().includes(queryParam) ||
          p.description?.toLowerCase().includes(queryParam) ||
          p.brand?.toLowerCase().includes(queryParam)
        );
      });

      const colorsSet = new Set();
      const sizesSet = new Set();
      results.forEach(p => {
        if (p.color) colorsSet.add(p.color);
        if (Array.isArray(p.sizes)) p.sizes.forEach(s => sizesSet.add(s));
      });

      setAvailableColors([...colorsSet]);
      setAvailableSizes(
        [...sizesSet].sort((a, b) => {
          const ai = SIZE_ORDER.indexOf(a.toUpperCase());
          const bi = SIZE_ORDER.indexOf(b.toUpperCase());
          if (ai !== -1 && bi !== -1) return ai - bi;
          return a.localeCompare(b);
        })
      );
      setAllProducts(results);
      setLoading(false);
    }
    fetchProducts();
  }, [categoryParam, subcategoryParam, genderParam, queryParam]);

  // Client-side filtering — instant, no extra Firestore queries
  useEffect(() => {
    const min = filters.priceMin !== '' ? Number(filters.priceMin) : 0;
    const max = filters.priceMax !== '' ? Number(filters.priceMax) : Infinity;

    setFiltered(
      allProducts.filter(p => {
        const matchesPrice = p.price >= min && p.price <= max;
        const matchesColor = filters.color
          ? p.color?.toLowerCase() === filters.color.toLowerCase()
          : true;
        const matchesSize =
          categoryParam === 'aksesoari'
            ? true
            : filters.size
            ? Array.isArray(p.sizes) &&
              p.sizes.some(s => s.toLowerCase() === filters.size.toLowerCase())
            : true;
        return matchesPrice && matchesColor && matchesSize;
      })
    );
  }, [allProducts, filters, categoryParam]);

  const resetFilters = useCallback(() => {
    setFilters({ priceMin: '', priceMax: '', color: '', size: '' });
  }, []);

  const activeFilterCount = [
    filters.priceMin !== '',
    filters.priceMax !== '',
    filters.color !== '',
    filters.size !== '',
  ].filter(Boolean).length;

  // Naslov stranice — pokazuje kontekst pretrage/kategorije
  const genderLabel = genderParam === 'zene' ? ' za žene' : genderParam === 'muskarci' ? ' za muškarce' : '';
  const pageTitle = queryParam
    ? `Rezultati za „${queryParam}"`
    : subcategoryParam
    ? subcategoryParam.charAt(0).toUpperCase() + subcategoryParam.slice(1) + genderLabel
    : categoryParam
    ? (categoryParam === 'odeca' ? 'Odeća' : categoryParam === 'aksesoari' ? 'Aksesoari' : categoryParam) + genderLabel
    : 'Svi proizvodi';

  const sortedResults = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0;
  });

  // Paginacija ("Prikaži još") — resetuje se kad se promene rezultati ili sortiranje
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filtered, sortBy]);
  const visibleResults = sortedResults.slice(0, visibleCount);

  const FilterPanel = (
    <aside className={`filters-panel${isMobile ? ' filters-panel--mobile' : ''}${isMobile && filtersOpen ? ' filters-panel--open' : ''}`}>
      <div className="filters-header">
        <span className="filters-title">Filteri</span>
        {activeFilterCount > 0 && (
          <button className="filters-reset" onClick={resetFilters} type="button">
            Obriši sve <X size={13} />
          </button>
        )}
      </div>

      {/* Price */}
      <FilterSection title="Cena">
        <div className="price-inputs">
          <div className="price-input-wrap">
            <input
              type="number"
              className="price-input"
              placeholder="Min"
              min={0}
              value={filters.priceMin}
              onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))}
            />
            <span className="price-currency">RSD</span>
          </div>
          <span className="price-separator">—</span>
          <div className="price-input-wrap">
            <input
              type="number"
              className="price-input"
              placeholder="Max"
              min={0}
              value={filters.priceMax}
              onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))}
            />
            <span className="price-currency">RSD</span>
          </div>
        </div>
      </FilterSection>

      {/* Color */}
      {availableColors.length > 0 && (
        <FilterSection title="Boja">
          <div className="color-list">
            {availableColors.map((color, i) => {
              const hex = colorTranslationMap[color.toLowerCase()] || color;
              const isLight = ['#ffffff', '#f2ff00'].includes(hex);
              const isActive = filters.color === color;
              return (
                <button
                  key={i}
                  className={`color-row${isActive ? ' color-row--active' : ''}`}
                  onClick={() =>
                    setFilters(f => ({ ...f, color: f.color === color ? '' : color }))
                  }
                  type="button"
                >
                  <span
                    className="color-dot"
                    style={{
                      background: hex,
                      ...(isLight ? { border: '1px solid #ccc' } : {}),
                    }}
                  />
                  <span>{color.charAt(0).toUpperCase() + color.slice(1)}</span>
                  {isActive && <Check size={13} className="color-check" />}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Size */}
      {categoryParam !== 'aksesoari' && availableSizes.length > 0 && (
        <FilterSection title="Veličina">
          <div className="size-pills">
            {availableSizes.map(size => (
              <button
                key={size}
                className={`size-pill${filters.size === size ? ' size-pill--active' : ''}`}
                onClick={() =>
                  setFilters(f => ({ ...f, size: f.size === size ? '' : size }))
                }
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}
    </aside>
  );

  return (
    <div className="search-page">

      {/* Mobile filter bar */}
      {isMobile && (
        <div className="mobile-filter-bar">
          <button
            className="mobile-filter-toggle"
            onClick={() => setFiltersOpen(o => !o)}
            type="button"
          >
            <SlidersHorizontal size={16} />
            <span>Filteri</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount}</span>
            )}
          </button>
          <select
            className="search-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="default">Podrazumevano</option>
            <option value="price-asc">Cena: rastuće</option>
            <option value="price-desc">Cena: opadajuće</option>
          </select>
        </div>
      )}

      {/* Mobile overlay backdrop */}
      {isMobile && filtersOpen && (
        <div className="filters-overlay" onClick={() => setFiltersOpen(false)} />
      )}

      {/* Filter panel */}
      {(!isMobile || filtersOpen) && FilterPanel}

      {/* Results */}
      <div className="results-area">
        <h1 className="search-page-title">{pageTitle}</h1>
        {!isMobile && (
          <div className="search-results-header">
            <span className="search-results-count">
              {loading
                ? 'Učitavanje...'
                : `${filtered.length} ${filtered.length === 1 ? 'proizvod' : 'proizvoda'}`}
            </span>
            <select
              className="search-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="default">Sortiraj: Podrazumevano</option>
              <option value="price-asc">Cena: rastuće</option>
              <option value="price-desc">Cena: opadajuće</option>
            </select>
          </div>
        )}

        {isMobile && (
          <p className="mobile-count">
            {loading
              ? 'Učitavanje...'
              : `${filtered.length} ${filtered.length === 1 ? 'proizvod' : 'proizvoda'}`}
          </p>
        )}

        {loading ? (
          <p className="text-center">Učitavanje...</p>
        ) : filtered.length === 0 ? (
          <div className="no-results">
            <p>Nema pronađenih proizvoda.</p>
            {activeFilterCount > 0 && (
              <button className="no-results-reset" onClick={resetFilters} type="button">
                Obriši filtere
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="product-list">
              {visibleResults.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {visibleCount < sortedResults.length && (
              <div className="load-more-wrap">
                <button
                  className="load-more-btn"
                  type="button"
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                >
                  Prikaži još ({sortedResults.length - visibleCount})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
