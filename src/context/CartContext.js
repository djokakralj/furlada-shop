import React, { createContext, useContext, useState } from 'react';

// Kreiramo CartContext
const CartContext = createContext();

// Komponenta koja omotava celu aplikaciju i omogućava pristup kontekstu
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

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
