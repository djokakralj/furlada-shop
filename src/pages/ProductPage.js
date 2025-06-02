import React, { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { getProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductPage.css';

function ProductPage() {
  const [match, params] = useRoute('/product/:id');
  const { id } = params || {};
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(0);

  // Dodaj state za izabranu boju i veličinu
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      const allProducts = await getProducts();
      const found = allProducts.find((p) => String(p.id) === id);
      setProduct(found);
      // Ako proizvod ima boju, automatski selektuj prvu
      if (found) {
        if (Array.isArray(found.colors) && found.colors.length > 0) {
          setSelectedColor(found.colors[0]);
        } else if (found.color) {
          setSelectedColor(found.color);
        }
        if (Array.isArray(found.sizes) && found.sizes.length > 0) {
          setSelectedSize(found.sizes[0]);
        }
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (!product) return <p>Učitavanje...</p>;

  // Pripremi slike (imageUrls ili fallback na imageUrl)
  const images = Array.isArray(product.imageUrls) && product.imageUrls.length > 0
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  // Pripremi veličine
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  // Pripremi boje (ako ima više boja)
  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : product.color
      ? [product.color]
      : [];

  // Handler za dodavanje u korpu
  const handleAddToCart = () => {
    addToCart({
      ...product,
      size: selectedSize,
      color: selectedColor,
    });
  };

  return (
    <div className="product-page" style={{maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 12, padding: 32, display: 'flex', gap: 40, flexWrap: 'wrap'}}>
      {/* Leva strana: slike */}
      <div style={{flex: '1 1 350px', minWidth: 320}}>
        <div className="product-carousel">
          {images.length > 0 ? (
            <img
              src={images[activeIndex]}
              alt={product.name}
              style={{width: 400, height: 'auto', objectFit: 'cover', borderRadius: 8}}
            />
          ) : (
            <div style={{width: 400, height: 400, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa'}}>Nema slike</div>
          )}
          {images.length > 1 && (
            <div className="carousel-thumbnails" style={{display: 'flex', gap: 8, marginTop: 10}}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Slika ${i + 1}`}
                  className={i === activeIndex ? 'active' : ''}
                  style={{
                    width: 60, height: 60, objectFit: 'cover', borderRadius: 4,
                    border: i === activeIndex ? '2px solid #000' : '2px solid transparent', cursor: 'pointer'
                  }}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desna strana: info */}
      <div className="product-info" style={{flex: '1 1 350px', minWidth: 320}}>
        <h2 style={{fontWeight: 700, fontSize: 28, marginBottom: 8}}>{product.name}</h2>
        <div style={{fontSize: 22, fontWeight: 600, margin: '10px 0 18px 0'}}>{product.price} RSD</div>
        <div style={{marginBottom: 18, color: '#444'}}>{product.description}</div>
        {/* Izbor boje */}
        {colors.length > 0 && (
          <div style={{marginBottom: 16}}>
            <div style={{marginBottom: 6, fontWeight: 500}}>Boja:</div>
            <div style={{display: 'flex', gap: 10}}>
              {colors.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 16,
                    border: selectedColor === c ? '2px solid #b4002b' : '1px solid #ddd',
                    background: selectedColor === c ? '#fbe6ee' : '#f5f5f5',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Izbor veličine */}
        {sizes.length > 0 && (
          <div style={{marginBottom: 16}}>
            <div style={{marginBottom: 6, fontWeight: 500}}>Veličina:</div>
            <div style={{display: 'flex', gap: 10}}>
              {sizes.map((sz, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '4px 14px',
                    borderRadius: 16,
                    border: selectedSize === sz ? '2px solid #b4002b' : '1px solid #ddd',
                    background: selectedSize === sz ? '#fbe6ee' : '#f5f5f5',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          className="add-to-cart"
          style={{
            marginTop: 20,
            padding: '12px 32px',
            background: '#b4002b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer'
          }}
          onClick={handleAddToCart}
          disabled={sizes.length > 0 && !selectedSize}
        >
          Dodajte u korpu
        </button>
        <div style={{marginTop: 24, color: 'green', fontWeight: 500}}>Raspoloživo</div>
      </div>
    </div>
  );
}

export default ProductPage;