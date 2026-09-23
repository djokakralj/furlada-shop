import React, { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { getProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './ProductPage.css';

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pp-accordion">
      <button className="pp-accordion-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="pp-accordion-body">{children}</div>}
    </div>
  );
}

function ProductPage() {
  const [, params] = useRoute('/product/:id');
  const { id } = params || {};
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      const allProducts = await getProducts();
      const found = allProducts.find((p) => String(p.id) === id);
      setProduct(found || null);
      setLoading(false);
      if (found) {
        if (Array.isArray(found.colors) && found.colors.length > 0) setSelectedColor(found.colors[0]);
        else if (found.color) setSelectedColor(found.color);
        if (Array.isArray(found.sizes) && found.sizes.length > 0) setSelectedSize('');
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="pp-loading">
      <div className="pp-loading-bar" />
    </div>
  );

  if (!product) return (
    <div className="pp-not-found">
      <p>Proizvod nije pronađen.</p>
      <Link href="/search" className="pp-back-link">← Nazad na kolekciju</Link>
    </div>
  );

  const images = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl ? [product.imageUrl] : [];

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : product.color ? [product.color] : [];

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart({ ...product, size: selectedSize, color: selectedColor });
    showToast(`${product.name} dodat u korpu`);
  };

  const categoryLabel = product.category
    ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
    : 'Kolekcija';

  return (
    <div className="pp-page">

      {/* ── GALLERY ───────────────────────────── */}
      <div className="pp-gallery">
        {images.length > 1 && (
          <div className="pp-thumbnails">
            {images.map((img, i) => (
              <button
                key={i}
                className={`pp-thumb${i === activeIndex ? ' pp-thumb--active' : ''}`}
                onClick={() => setActiveIndex(i)}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>
        )}
        <div className="pp-main-image">
          {images.length > 0
            ? <img src={images[activeIndex]} alt={product.name} />
            : <div className="pp-no-image">Nema slike</div>
          }
        </div>
      </div>

      {/* ── INFO ──────────────────────────────── */}
      <div className="pp-info">

        {/* Breadcrumb */}
        <nav className="pp-breadcrumb">
          <Link href="/">Početna</Link>
          <span>/</span>
          <Link href={`/search?category=${product.category || ''}`}>{categoryLabel}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Name & Price */}
        <h1 className="pp-name">{product.name}</h1>
        <div className="pp-price">
          {Number(product.price).toLocaleString('sr-RS')} RSD
        </div>

        <div className="pp-divider" />

        {/* Color */}
        {colors.length > 0 && (
          <div className="pp-option-group">
            <div className="pp-option-label">
              Boja — <span className="pp-option-value">{selectedColor}</span>
            </div>
            <div className="pp-color-options">
              {colors.map((c, i) => (
                <button
                  key={i}
                  className={`pp-color-btn${selectedColor === c ? ' pp-color-btn--active' : ''}`}
                  onClick={() => setSelectedColor(c)}
                  title={c}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size */}
        {sizes.length > 0 && (
          <div className="pp-option-group">
            <div className="pp-option-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Veličina {selectedSize && <span className="pp-option-value">— {selectedSize}</span>}</span>
              <Link href="/velicine" className="pp-size-guide">Vodič za veličine</Link>
            </div>
            <div className="pp-size-options">
              {sizes.map((sz, i) => (
                <button
                  key={i}
                  className={`pp-size-btn${selectedSize === sz ? ' pp-size-btn--active' : ''}`}
                  onClick={() => { setSelectedSize(sz); setSizeError(false); }}
                >
                  {sz}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="pp-size-error">Molimo odaberite veličinu.</p>
            )}
          </div>
        )}

        {/* CTA */}
        <button className="pp-add-btn" onClick={handleAddToCart}>
          Dodaj u korpu
        </button>

        <div className="pp-availability">
          <span className="pp-dot" /> Na stanju
        </div>

        <div className="pp-divider" />

        {/* Accordions */}
        {product.description && (
          <Accordion title="Opis proizvoda" defaultOpen={true}>
            <p>{product.description}</p>
          </Accordion>
        )}

        <Accordion title="Detalji i sastav">
          <ul>
            <li>Šifra artikla: {product.id}</li>
            {product.brand && <li>Brend: {product.brand}</li>}
            {selectedColor && <li>Boja: {selectedColor}</li>}
          </ul>
        </Accordion>

        <Accordion title="Dostava i povrat">
          <ul>
            <li>Standardna dostava: 300 RSD</li>
            <li>Lično preuzimanje: besplatno</li>
            <li>Povrat u roku od 14 dana</li>
          </ul>
        </Accordion>

      </div>
    </div>
  );
}

export default ProductPage;
