import React, { useState } from 'react';
import './HomePage.css';
import { FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';

const HomePage = () => {
    // Staticki podaci o proizvodima
    const products = [
      {
        id: 1,
        name: 'Majica',
        description: 'Pamuk, udobna majica za svaki dan.',
        price: 19.99,
        imageUrl: '/majica.jpg'
      },
      {
        id: 2,
        name: 'Pantalone',
        description: 'Stilizovane pantalone, pogodne za večernje izlaze.',
        price: 39.99,
        imageUrl: 'https://via.placeholder.com/200x200.png?text=Pantalone'
      },
      {
        id: 3,
        name: 'Jakna',
        description: 'Topla jakna za zimske mesece.',
        price: 59.99,
        imageUrl: 'https://via.placeholder.com/200x200.png?text=Jakna'
      },
      {
        id: 4,
        name: 'Čarape',
        description: 'Pametne čarape, idealne za sport.',
        price: 9.99,
        imageUrl: 'https://via.placeholder.com/200x200.png?text=Carape'
      }
    ];
  
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
  
    // Dodavanje proizvoda u korpu
    const addToCart = (product) => {
      setCart([...cart, product]);
    };

    const toggleCart = () => {
        setShowCart(!showCart); // Menja stanje (prikazivanje / sakrivanje korpe)
      };
  
    return (
      <div className="home-page">
        
        <div className="banner">
        <h1>Nova kolekcija je stigla!</h1>
        <p>Otkrijte najbolje komade za ovu sezonu.</p>
        <button className="shop-now">Pogledaj kolekciju</button>

      </div>
        <div className="product-list">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <img src={product.imageUrl} alt={product.name} />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <span>{product.price} RSD</span>
              <button onClick={() => addToCart(product)}>Dodaj u korpu</button>
            </div>
          ))}
        </div>

         {/* Dugme sa ikonom korpe */}
      <button className="cart-button" onClick={toggleCart}>
        <span>🛒</span> {/* Ovdje možete koristiti ikonu korpe */}
      </button>

      {/* Prikazivanje korpe */}
      {showCart && (
        <div className="cart">
          <h3>Korpa ({cart.length} proizvoda)</h3>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} - {item.price} RSD
              </li>
            ))}
          </ul>
          <h4>Ukupno: {cart.reduce((total, item) => total + item.price, 0)} RSD</h4>
        </div>
      )}
      </div>
    );
  };    
  
  const Footer = () => {
    return (
      <footer className="footer">
        <div className="footer-content">
          <div className="socials">
            <a href="https://www.instagram.com/tvojprofil" target="_blank" rel="noopener noreferrer">
              <FaInstagram /> Instagram
            </a>
            <a href="tel:+381612345678">
              <FaPhone /> +381 61 234 5678
            </a>
            <a href="mailto:info@tvojshop.com">
              <FaEnvelope /> info@tvojshop.com
            </a>
          </div>
          <p>© 2025 Tvoj Shop. Sva prava zadržana.</p>
        </div>
      </footer>
    );
  };

  export default HomePage;