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
  const cartKey = (item) => `${item.id}__${item.size || ''}__${item.color || ''}`;

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const key = cartKey(product);
      const existing = prevItems.find(item => cartKey(item) === key);
      if (existing) {
        return prevItems.map(item =>
          cartKey(item) === key
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (key) => {
    setCartItems((prevItems) => prevItems.filter(item => cartKey(item) !== key));
  };

  const updateQuantity = (key, quantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map(item =>
          cartKey(item) === key
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
    <CartContext.Provider value={{ cartItems, cartKey, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook koji omogućava pristup CartContext-u
export const useCart = () => useContext(CartContext);