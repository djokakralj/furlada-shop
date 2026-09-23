import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem('wishlist');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = (id) => wishlist.some(p => String(p.id) === String(id));

  // Dodaj ako nije, ukloni ako jeste. Vraća true ako je dodat.
  const toggleWishlist = (product) => {
    let added = false;
    setWishlist(prev => {
      if (prev.some(p => String(p.id) === String(product.id))) {
        return prev.filter(p => String(p.id) !== String(product.id));
      }
      added = true;
      return [...prev, product];
    });
    return added;
  };

  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
