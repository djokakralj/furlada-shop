import React from 'react';
import './Footer.css';
import { FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="socials">
          <a href="https://www.instagram.com/furlada/" target="_blank" rel="noopener noreferrer">
            <FaInstagram /> Instagram
          </a>
          <a href="tel:+381612345678">
            <FaPhone /> +381 61 234 5678
          </a>
          <a href="mailto:furladagr@gmail.com">
            <FaEnvelope /> furladagr@gmail.com
          </a>
        </div>
        <p>© 2025 Tvoj Shop. Sva prava zadržana.</p>
      </div>
    </footer>
  );
};

export default Footer;