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

  useEffect(() => {
    async function fetchProduct() {
      const allProducts = await getProducts();
      console.log('URL id:', id); // Debugging
      console.log('All products:', allProducts); // Debugging
      const found = allProducts.find((p) => String(p.id) === id); // Ensure type match
      setProduct(found);
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (!product) return <p>Učitavanje...</p>;

  return (
    <div className="product-page">
      <div className="product-carousel">
        <img
          src={product.imageUrls?.[activeIndex] || product.imageUrl}
          alt={product.name}
        />
        {product.imageUrls?.length > 1 && (
          <div className="carousel-thumbnails">
            {product.imageUrls.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Slika ${i + 1}`}
                className={i === activeIndex ? 'active' : ''}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">{product.price} RSD</p>
        <p className="description">{product.description}</p>
        <button className="add-to-cart" onClick={() => addToCart(product)}>
          Dodaj u korpu
        </button>
      </div>
    </div>
  );
}

export default ProductPage;