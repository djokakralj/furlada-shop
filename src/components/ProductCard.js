import React from 'react';
import { Link } from 'wouter';
import { useCart } from '../context/CartContext';
import '../pages/HomePage.css'; // Koristiš postojeće stilove

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
        />
        <div className="product-info">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <span>{product.price} RSD</span>
        </div>
      </Link>
      <button className="add-to-cart" onClick={() => addToCart(product)}>
        Dodaj u korpu
      </button>
    </div>
  );
};

export default ProductCard;
