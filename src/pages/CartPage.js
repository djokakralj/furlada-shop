import React from 'react';
import { useCart } from '../context/CartContext';
import './CartPage.css';
import { Link } from 'wouter';

const CartPage = () => {
  const { cartItems, removeFromCart } = useCart();

  const totalPrice = cartItems.reduce((total, item) => total + item.price, 0);

  return (
    <div className="cart-page">
      <h2>Korpa</h2>

      {cartItems.length === 0 ? (
        <p>Vaša korpa je prazna</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <Link href={`/product/${String(item.id)}`}>
              <div className="cart-item-info">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
              </Link>
              <div className="cart-item-price">
                <span>{item.price} RSD</span>
                <button onClick={() => removeFromCart(item.id)}>Ukloni</button>
              </div>
            </div>
          ))}

          {/* Totalna cena */}
          <div className="cart-total">
            <h3>Ukupno: {totalPrice.toFixed(2)} RSD</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
