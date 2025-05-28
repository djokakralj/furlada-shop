import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';
import './LoginPage.css';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../data/firebase';

function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

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
        setError('Pogrešno korisničko ime ili lozinka. Proverite podatke i pokušajte ponovo.');
      }
    } catch (err) {
      setError('Greška pri prijavi. Pokušajte ponovo.');
    }
  };

  return (
    <div className="login-page">
      <h2>Prijava</h2>
      <p style={{ textAlign: 'center', marginBottom: 18 }}>
        Prijavite se svojim korisničkim imenom i lozinkom
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Vaše korisničko ime</label>
        <input
          id="username"
          type="text"
          placeholder="Unesite korisničko ime"
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
        <a className="forgot-link" href="#">Zaboravljena lozinka?</a>
        <button type="submit">Prijavi se</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <div className="register-row">
        Niste član? <a className="register-link" href="/register">Registrujte se</a>
      </div>
    </div>
  );
}

export default LoginPage;