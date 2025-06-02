import React from 'react';
import { Link } from 'wouter';
import { useCart } from '../context/CartContext';
import '../pages/HomePage.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`}>
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
        />
      </Link>
      <div className="product-card-content">
        <h2>{product.name}</h2>
        <span>{Number(product.price).toLocaleString('sr-RS', { minimumFractionDigits: 2 })} RSD</span>
      </div>
      <button className="add-to-cart" onClick={() => addToCart(product)}>
        Dodaj u korpu
      </button>
    </div>
  );
};

export default ProductCard;