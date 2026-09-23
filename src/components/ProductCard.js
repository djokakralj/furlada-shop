import React from 'react';
import { Link } from 'wouter';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from './Toast';
import { NO_IMAGE } from '../data/constants';
import '../pages/HomePage.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product);
    showToast(`${product.name} dodat u korpu`);
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    showToast(added ? `${product.name} dodat u listu želja` : `${product.name} uklonjen iz liste želja`);
  };

  return (
    <div className="product-card">
      <button
        className={`wishlist-btn${liked ? ' wishlist-btn--active' : ''}`}
        onClick={handleWishlist}
        aria-label={liked ? 'Ukloni iz liste želja' : 'Dodaj u listu želja'}
        type="button"
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
      </button>
      <Link href={`/product/${product.id}`}>
        <img
          src={product.imageUrl || NO_IMAGE}
          alt={product.name}
          onError={(e) => { e.target.src = NO_IMAGE; }}
        />
      </Link>
      <div className="product-card-content">
        <h2>{product.name}</h2>
        <span>{Number(product.price).toLocaleString('sr-RS')} RSD</span>
      </div>
      <button className="add-to-cart" onClick={handleAdd}>
        Dodaj u korpu
      </button>
    </div>
  );
};

export default ProductCard;