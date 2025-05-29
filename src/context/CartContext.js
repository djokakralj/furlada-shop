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

  // Funkcija za dodavanje proizvoda u korpu
  const addToCart = (product) => {
    setCartItems((prevItems) => [...prevItems, product]);
  };

  // Funkcija za uklanjanje proizvoda iz korpe
  const removeFromCart =(id) => {
    setCartItems((prevItems) => {
      const productIndex = prevItems.findIndex(item => item.id === id);
      
      // Ako proizvod postoji, ukloni ga iz korpe
      if (productIndex !== -1) {
        const updatedCart = [...prevItems];
        updatedCart.splice(productIndex, 1);  // Uklanja samo jedan proizvod sa tim ID-jem
        return updatedCart;
      }
      return prevItems;
    });
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook koji omogućava pristup CartContext-u
export const useCart = () => useContext(CartContext);
