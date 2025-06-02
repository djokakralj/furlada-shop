import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/firebase';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart(); // Dodaj clearCart iz CartContext-a
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    street: '',
    number: '',
    postalCode: '',
    city: '',
    delivery: 'kurir',
    payment: 'pouzece',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // AUTOMATSKO POPUNJAVANJE PODATAKA AKO JE ULOGOVAN
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setForm(f => ({
            ...f,
            name: data.name || '',
            surname: data.surname || '',
            phone: data.phone || '',
            email: data.email || user.email || '',
            street: data.address?.street || '',
            number: data.address?.number || '',
            postalCode: data.address?.postalCode || '',
            city: data.address?.city || '',
          }));
        } else {
          setForm(f => ({ ...f, email: user.email || '' }));
        }
      }
    };
    fetchUserData();
  }, [user]);

  const totalPrice = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.surname || !form.phone || !form.email || !form.street || !form.number || !form.postalCode || !form.city) {
      setError('Popunite sva obavezna polja.');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, "orders"), {
        userId: user ? user.uid : null,
        userEmail: form.email,
        customer: {
          name: form.name,
          surname: form.surname,
          phone: form.phone,
          email: form.email,
          address: {
            street: form.street,
            number: form.number,
            postalCode: form.postalCode,
            city: form.city,
          },
        },
        delivery: form.delivery,
        payment: form.payment,
        items: cartItems,
        total: totalPrice,
        createdAt: Timestamp.now(),
        status: "primljena"
      });
      clearCart(); // Isprazni korpu
      setSuccess('Hvala na kupovini! Vaša porudžbina je uspešno poslata.');
    } catch (err) {
      setError('Greška pri slanju porudžbine: ' + err.message);
    }
  };

  if (success) {
    return (
      <div className="checkout-empty">
        <h2>{success}</h2>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Vaša korpa je prazna</h2>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={handleSubmit}>
        <h2>Podaci za dostavu</h2>
        <div className="checkout-row">
          <input name="name" placeholder="Ime" value={form.name} onChange={handleChange} required />
          <input name="surname" placeholder="Prezime" value={form.surname} onChange={handleChange} required />
        </div>
        <div className="checkout-row">
          <input name="phone" placeholder="Telefon" value={form.phone} onChange={handleChange} required />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="checkout-row">
          <input name="street" placeholder="Ulica" value={form.street} onChange={handleChange} required />
          <input name="number" placeholder="Broj" value={form.number} onChange={handleChange} required />
        </div>
        <div className="checkout-row">
          <input name="postalCode" placeholder="Poštanski broj" value={form.postalCode} onChange={handleChange} required />
          <input name="city" placeholder="Grad" value={form.city} onChange={handleChange} required />
        </div>
        <div className="checkout-section">
          <label>Način dostave:</label>
          <div className="checkout-radio-group">
            <label>
              <input type="radio" name="delivery" value="kurir" checked={form.delivery === 'kurir'} onChange={handleChange} />
              Kurirska služba (300 RSD)
            </label>
            <label>
              <input type="radio" name="delivery" value="preuzimanje" checked={form.delivery === 'preuzimanje'} onChange={handleChange} />
              Lično preuzimanje (besplatno)
            </label>
          </div>
        </div>
        <div className="checkout-section">
          <label>Način plaćanja:</label>
          <div className="checkout-radio-group">
            <label>
              <input type="radio" name="payment" value="pouzece" checked={form.payment === 'pouzece'} onChange={handleChange} />
              Plaćanje pouzećem
            </label>
            <label>
              <input type="radio" name="payment" value="kartica" checked={form.payment === 'kartica'} onChange={handleChange} />
              Karticom online
            </label>
          </div>
        </div>
        {error && <div className="checkout-error">{error}</div>}
        <button className="checkout-btn" type="submit">Potvrdi porudžbinu</button>
      </form>
      <div className="checkout-summary">
        <h3>Vaša porudžbina</h3>
        <ul>
          {cartItems.map((item, idx) => (
            <li key={idx} className="checkout-summary-item">
              <img src={item.imageUrl} alt={item.name} />
              <div>
                <div className="checkout-summary-name">{item.name}</div>
                <div className="checkout-summary-meta">
                  {item.color && <span>Boja: {item.color}</span>}
                  {item.size && <span>Veličina: {item.size}</span>}
                  <span>Količina: {item.quantity || 1}</span>
                </div>
              </div>
              <div className="checkout-summary-price">
                {(item.price * (item.quantity || 1)).toLocaleString()} RSD
              </div>
            </li>
          ))}
        </ul>
        <div className="checkout-summary-total">
          <span>Ukupno:</span>
          <span>{totalPrice.toLocaleString()} RSD</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;