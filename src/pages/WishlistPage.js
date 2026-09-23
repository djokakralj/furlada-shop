import React from 'react';
import { Link } from 'wouter';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import './WishlistPage.css';

function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="wishlist-page">
      <h1>Lista želja</h1>

      {wishlist.length === 0 ? (
        <div className="wishlist-empty">
          <Heart size={40} strokeWidth={1} />
          <p>Vaša lista želja je prazna.</p>
          <Link href="/search" className="wishlist-empty-btn">Pogledaj proizvode</Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;
