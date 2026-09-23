import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../data/firebase.js';
import { setDoc, doc } from 'firebase/firestore';
import './LoginPage.css';

function RegisterPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (submitting) return;
  setError('');
  setSuccess('');
  if (!name || !surname || !phone || !street || !number || !postalCode || !city) {
    setError('Popunite sva polja!');
    return;
  }
  // Provera jačine lozinke: najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedan broj
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    setError('Lozinka mora imati najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedan broj.');
    return;
  }
  setSubmitting(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Upis u Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      name,
      surname,
      phone,
      address: {
        street,
        number,
        postalCode,
        city,
      },
    });
    // createUserWithEmailAndPassword odmah i uloguje korisnika — vodi ga na profil
    setSuccess('Uspešno ste se registrovali! Dobrodošli.');
    setTimeout(() => setLocation('/profile'), 1500);
  } catch (err) {
    setError('Greška pri registraciji: ' + err.message);
    setSubmitting(false);
  }
};

  return (
    <div className="login-page">
      <h2>Registracija</h2>
      <p style={{ textAlign: 'center', marginBottom: 18 }}>
        Kreirajte novi nalog
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Ime</label>
        <input
          id="name"
          type="text"
          placeholder="Unesite ime"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <label htmlFor="surname">Prezime</label>
        <input
          id="surname"
          type="text"
          placeholder="Unesite prezime"
          value={surname}
          onChange={e => setSurname(e.target.value)}
        />
        <label htmlFor="phone">Telefon</label>
        <input
          id="phone"
          type="tel"
          placeholder="Unesite broj telefona"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <label htmlFor="street">Ulica</label>
        <input
          id="street"
          type="text"
          placeholder="Unesite ulicu"
          value={street}
          onChange={e => setStreet(e.target.value)}
        />
        <label htmlFor="number">Broj</label>
        <input
          id="number"
          type="text"
          placeholder="Unesite broj"
          value={number}
          onChange={e => setNumber(e.target.value)}
        />
        <label htmlFor="postalCode">Poštanski broj</label>
        <input
          id="postalCode"
          type="text"
          placeholder="Unesite poštanski broj"
          value={postalCode}
          onChange={e => setPostalCode(e.target.value)}
        />
        <label htmlFor="city">Grad</label>
        <input
          id="city"
          type="text"
          placeholder="Unesite grad"
          value={city}
          onChange={e => setCity(e.target.value)}
        />
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
        <button type="submit" disabled={submitting}>
          {submitting ? 'Registracija...' : 'Registruj se'}
        </button>
        {error && <p className="login-error">{error}</p>}
        {success && <p className="login-success">{success}</p>}
      </form>
      <div className="register-row">
        Već imate nalog? <Link className="register-link" href="/login">Prijavite se</Link>
      </div>
    </div>
  );
}

export default RegisterPage;