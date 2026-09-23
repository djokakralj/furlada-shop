import React, { useState } from 'react';
import './Footer.css';
import { Link } from 'wouter';
import { Instagram, Phone, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">

      {/* ── Newsletter ── */}
      <div className="footer-newsletter">
        <div className="footer-newsletter-inner">
          <div className="footer-newsletter-text">
            <h3>Budite prvi koji saznaju</h3>
            <p>Prijavite se za ekskluzivne ponude, nove kolekcije i vijesti iz svijeta mode.</p>
          </div>
          {subscribed ? (
            <div className="footer-newsletter-thanks">
              Hvala! Prijavili ste se uspješno.
            </div>
          ) : (
            <form className="footer-newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Vaša email adresa"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="footer-main">
        <div className="footer-brand-col">
          <Link href="/" className="footer-logo">FURLADA</Link>
          <p className="footer-tagline">Moda koja govori vaším jezikom.</p>
          <div className="footer-socials">
            <a href="https://www.instagram.com/furlada/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="tel:+381612345678" aria-label="Telefon">
              <Phone size={18} />
            </a>
            <a href="mailto:furladagr@gmail.com" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Kupovina</h4>
          <ul>
            <li><Link href="/search?category=odeca&gender=zene">Ženska odeća</Link></li>
            <li><Link href="/search?category=odeca&gender=muskarci">Muška odeća</Link></li>
            <li><Link href="/search?category=aksesoari">Aksesoari</Link></li>
            <li><Link href="/search">Nova kolekcija</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Informacije</h4>
          <ul>
            <li><Link href="/dostava">Dostava i povrat</Link></li>
            <li><Link href="/velicine">Vodič za veličine</Link></li>
            <li><Link href="/faq">Česta pitanja</Link></li>
            <li><Link href="/uslovi">Uslovi korišćenja</Link></li>
            <li><Link href="/privatnost">Politika privatnosti</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Kontakt</h4>
          <ul>
            <li>
              <a href="mailto:furladagr@gmail.com">furladagr@gmail.com</a>
            </li>
            <li>
              <a href="tel:+381612345678">+381 61 234 5678</a>
            </li>
            <li>
              <a href="https://www.instagram.com/furlada/" target="_blank" rel="noopener noreferrer">
                @furlada
              </a>
            </li>
          </ul>
          <div className="footer-hours">
            <span>Pon – Pet: 09:00 – 17:00</span>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Furlada. Sva prava zadržana.</span>
        <div className="footer-bottom-links">
          <Link href="/privatnost">Privatnost</Link>
          <Link href="/uslovi">Uslovi</Link>
          <Link href="/faq">Kolačići</Link>
        </div>
        <div className="footer-payment">
          <span className="footer-pay-badge">VISA</span>
          <span className="footer-pay-badge">MC</span>
          <span className="footer-pay-badge">PayPal</span>
          <span className="footer-pay-badge">Cash</span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
