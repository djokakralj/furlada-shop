import React from 'react';
import { useCart } from '../context/CartContext';
import './CartPage.css';
import { Link, useLocation } from 'wouter';
import { ShoppingBag } from 'lucide-react';
import { NO_IMAGE } from '../data/constants';

const CartPage = () => {
  const { cartItems, cartKey, removeFromCart, updateQuantity } = useCart();
  const [, setLocation] = useLocation();

  const totalItems = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="cart-layout">
      <div className="cart-main">
        <div className="cart-box">
          <h2>Vaša korpa ({totalCount})</h2>
          <p className="cart-desc">Ovde se nalaze proizvodi koje želiš da kupiš.</p>
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={40} strokeWidth={1} style={{ color: 'var(--gray-400)', marginBottom: 12 }} />
              <p>Vaša korpa je prazna.</p>
              <Link href="/search" className="cart-empty-btn">Nastavi kupovinu</Link>
            </div>
          ) : (
            <>
              <div className="cart-list">
                {cartItems.map((item) => {
                  const key = cartKey(item);
                  return (
                  <div className="cart-product" key={key}>
                    <img
                      src={item.imageUrl || NO_IMAGE}
                      alt={item.name}
                      className="cart-product-img"
                      onError={(e) => { e.target.src = NO_IMAGE; }}
                    />
                    <div className="cart-product-info">
                      <Link href={`/product/${String(item.id)}`}>
                        <span className="cart-product-name">{item.name}</span>
                      </Link>
                      <div className="cart-product-meta">
                        {item.color && <span>Boja: {item.color}</span>}
                        {item.size && <span>Veličina: {item.size}</span>}
                      </div>
                    </div>
                    <div className="cart-product-qty">
                      <button onClick={() => {
                        if ((item.quantity || 1) <= 1) removeFromCart(key);
                        else updateQuantity(key, (item.quantity || 1) - 1);
                      }}>-</button>
                      <span>{item.quantity || 1}</span>
                      <button onClick={() => updateQuantity(key, (item.quantity || 1) + 1)}>+</button>
                    </div>
                    <div className="cart-product-price">
                      <span>{(item.price * (item.quantity || 1)).toLocaleString('sr-RS')} RSD</span>
                      <button className="cart-remove-btn" onClick={() => removeFromCart(key)}>Ukloni proizvod</button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="cart-summary">
        <div className="cart-summary-box">
          <h3>Pregled porudžbine ({totalCount} kom.)</h3>
          <div className="cart-summary-row">
            <span>Iznos porudžbine:</span>
            <span>{totalItems.toLocaleString('sr-RS')} RSD</span>
          </div>
          <div className="cart-summary-row">
            <span>Dostava:</span>
            <span style={{ color: 'var(--gray-600)', fontStyle: 'italic' }}>Odabir pri narudžbini</span>
          </div>
          <div className="cart-summary-total">
            <span>Ukupno (bez dostave):</span>
            <span>{totalItems.toLocaleString('sr-RS')} RSD</span>
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
