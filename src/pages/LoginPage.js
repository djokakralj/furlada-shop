import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'wouter';
import './LoginPage.css';
import { setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../data/firebase';

function LoginPage() {
  const { login, user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  // Već ulogovan korisnik nema šta da traži na login stranici
  useEffect(() => {
    if (!loading && user) setLocation('/profile');
  }, [user, loading, setLocation]);

  const handleForgotPassword = async () => {
    if (!username) {
      setError('Unesite email adresu za reset lozinke.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, username);
      setResetMsg('Email za reset lozinke je poslat. Proverite inbox.');
      setError('');
    } catch {
      setError('Greška pri slanju emaila. Proverite da li je email ispravno unesen.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Set persistence based on "Zapamti me"
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
      );
      const success = await login(username, password);
      if (success) {
        setLocation('/profile');
      } else {
        setError('Pogrešna email adresa ili lozinka. Proverite podatke i pokušajte ponovo.');
      }
    } catch (err) {
      setError('Greška pri prijavi. Pokušajte ponovo.');
    }
  };

  return (
    <div className="login-page">
      <h2>Prijava</h2>
      <p style={{ textAlign: 'center', marginBottom: 18 }}>
        Prijavite se svojom email adresom i lozinkom
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Email adresa</label>
        <input
          id="username"
          type="email"
          placeholder="Unesite email adresu"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <label htmlFor="password">Vaša lozinka</label>
        <input
          id="password"
          type="password"
          placeholder="Unesite lozinku"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div className="remember-row">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          <label htmlFor="remember">Zapamti me</label>
        </div>
        <span className="forgot-link" onClick={handleForgotPassword}>Zaboravljena lozinka?</span>
        <button type="submit">Prijavi se</button>
        {error && <p className="login-error">{error}</p>}
        {resetMsg && <p className="login-success">{resetMsg}</p>}
      </form>
      <div className="register-row">
        Niste član? <Link className="register-link" href="/register">Registrujte se</Link>
      </div>
    </div>
  );
}

export default LoginPage;