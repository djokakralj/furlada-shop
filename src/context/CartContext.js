import React, { createContext, useContext, useState, useEffect } from 'react';

// Kreiramo CartContext
const CartContext = createContext();

export function CartProvider({ children }) {
  // Load cart from localStorage or start with empty array
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Dodavanje proizvoda u korpu (povećava količinu ako već postoji)
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Uklanjanje proizvoda iz korpe (uklanja ceo proizvod)
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== id));
  };

  // Menjanje količine proizvoda
  const updateQuantity = (id, quantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

   const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook koji omogućava pristup CartContext-u
export const useCart = () => useContext(CartContext);