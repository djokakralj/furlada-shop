import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../data/firebase.js';
import './LoginPage.css';

function RegisterPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess('Uspešno ste se registrovali! Sada se možete prijaviti.');
      setTimeout(() => setLocation('/login'), 2000);
    } catch (err) {
      setError('Greška pri registraciji: ' + err.message);
    }
  };

  return (
    <div className="login-page">
      <h2>Registracija</h2>
      <p style={{ textAlign: 'center', marginBottom: 18 }}>
        Kreirajte novi nalog
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email adresa</label>
        <input
          id="email"
          type="email"
          placeholder="Unesite email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <label htmlFor="password">Lozinka</label>
        <input
          id="password"
          type="password"
          placeholder="Unesite lozinku"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Registruj se</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
      </form>
      <div className="register-row">
        Već imate nalog? <a className="register-link" href="/login">Prijavite se</a>
      </div>
    </div>
  );
}

export default RegisterPage;