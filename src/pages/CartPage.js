import React from 'react';
import { useCart } from '../context/CartContext';
import './CartPage.css';
import { Link, useLocation } from 'wouter';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [, setLocation] = useLocation();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  return (
    <div className="cart-layout">
      <div className="cart-main">
        <div className="cart-box">
          <h2>Vaša korpa ({cartItems.length}):</h2>
          <p className="cart-desc">Ovde se nalaze proizvodi koje želiš da kupiš.</p>
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Vaša korpa je prazna.</p>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cartItems.map((item, index) => (
                  <div className="cart-product" key={index}>
                    <img src={item.imageUrl} alt={item.name} className="cart-product-img" />
                    <div className="cart-product-info">
                      <Link href={`/product/${String(item.id)}`}>
                        <span className="cart-product-name">{item.name}</span>
                      </Link>
                      <div className="cart-product-meta">
                        <span>Boja: {item.color || 'N/A'}</span>
                        <span>Veličina: {item.size || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="cart-product-qty">
                      <button onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} disabled={(item.quantity || 1) <= 1}>-</button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                    </div>
                    <div className="cart-product-price">
                      <span>{(item.price * (item.quantity || 1)).toLocaleString()} RSD</span>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>Ukloni proizvod</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="cart-summary">
        <div className="cart-summary-box">
          <h3>Pregled porudžbine ({cartItems.length})</h3>
          <div className="cart-summary-row">
            <span>Iznos porudžbine:</span>
            <span>{totalPrice.toLocaleString()} RSD</span>
          </div>
          <div className="cart-summary-row">
            <span>Ukupan trošak dostave:</span>
            <span>0,00 RSD</span>
          </div>
          <div className="cart-summary-row">
            <span>Akcijska ušteda:</span>
            <span className="cart-discount">0,00 RSD</span>
          </div>
          <div className="cart-summary-total">
            <span>Ukupno:</span>
            <span>{totalPrice.toLocaleString()} RSD</span>
          </div>
          <div className="cart-summary-note">
            (PDV je uračunat u cenu)
          </div>
          <button
            className="cart-summary-btn"
            disabled={cartItems.length === 0}
            onClick={() => setLocation('/checkout')}
          >
            Izaberi način dostave
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;