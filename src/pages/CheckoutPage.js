import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/firebase';
import { doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Link } from 'wouter';
import { NO_IMAGE } from '../data/constants';
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
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const DELIVERY_COST = 300;
  const itemsTotal = cartItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  const deliveryCost = form.delivery === 'kurir' ? DELIVERY_COST : 0;
  const totalPrice = itemsTotal + deliveryCost;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Adresa je obavezna samo za kurirsku dostavu
  const needsAddress = form.delivery === 'kurir';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const missingBase = !form.name || !form.surname || !form.phone || !form.email;
    const missingAddress = needsAddress && (!form.street || !form.number || !form.postalCode || !form.city);
    if (missingBase || missingAddress) {
      setError('Popunite sva obavezna polja.');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const docRef = await addDoc(collection(db, "orders"), {
        userId: user ? user.uid : null,
        userEmail: form.email,
        customer: {
          name: form.name,
          surname: form.surname,
          phone: form.phone,
          email: form.email,
          address: needsAddress ? {
            street: form.street,
            number: form.number,
            postalCode: form.postalCode,
            city: form.city,
          } : null,
        },
        delivery: form.delivery,
        payment: form.payment,
        items: cartItems,
        total: totalPrice,
        createdAt: Timestamp.now(),
        status: "primljena"
      });
      setOrderId(docRef.id);
      clearCart(); // Isprazni korpu
      setSuccess('Hvala na kupovini! Vaša porudžbina je uspešno poslata.');
    } catch (err) {
      setError('Greška pri slanju porudžbine: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-success-screen">
        <div className="checkout-success-icon">✓</div>
        <h2>Hvala na kupovini!</h2>
        <p>Vaša porudžbina je uspešno primljena. Kontaktiraćemo vas uskoro.</p>
        {orderId && (
          <p style={{ marginBottom: 8 }}>
            Broj porudžbine: <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {orderId && (
            <Link href={`/order/${orderId}`} className="checkout-success-btn">Prati porudžbinu</Link>
          )}
          <Link href="/" className="checkout-success-btn">Nastavi kupovinu</Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Vaša korpa je prazna</h2>
        <p>Dodajte proizvode u korpu pre nastavka.</p>
        <Link href="/search" className="checkout-success-btn">Pogledaj proizvode</Link>
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
        {needsAddress && (
          <>
            <div className="checkout-row">
              <input name="street" placeholder="Ulica" value={form.street} onChange={handleChange} required />
              <input name="number" placeholder="Broj" value={form.number} onChange={handleChange} required />
            </div>
            <div className="checkout-row">
              <input name="postalCode" placeholder="Poštanski broj" value={form.postalCode} onChange={handleChange} required />
              <input name="city" placeholder="Grad" value={form.city} onChange={handleChange} required />
            </div>
          </>
        )}
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
        <button className="checkout-btn" type="submit" disabled={submitting}>
          {submitting ? 'Slanje...' : 'Potvrdi porudžbinu'}
        </button>
      </form>
      <div className="checkout-summary">
        <h3>Vaša porudžbina</h3>
        <ul>
          {cartItems.map((item, idx) => (
            <li key={idx} className="checkout-summary-item">
              <img
                src={item.imageUrl || NO_IMAGE}
                alt={item.name}
                onError={(e) => { e.target.src = NO_IMAGE; }}
              />
              <div>
                <div className="checkout-summary-name">{item.name}</div>
                <div className="checkout-summary-meta">
                  {item.color && <span>Boja: {item.color}</span>}
                  {item.size && <span>Veličina: {item.size}</span>}
                  <span>Količina: {item.quantity || 1}</span>
                </div>
              </div>
              <div className="checkout-summary-price">
                {(item.price * (item.quantity || 1)).toLocaleString('sr-RS')} RSD
              </div>
            </li>
          ))}
        </ul>
        <div className="checkout-summary-total" style={{ fontWeight: 400, fontSize: '0.88rem', borderTop: 'none', paddingTop: 0, marginTop: 4 }}>
          <span>Dostava:</span>
          <span>{deliveryCost === 0 ? 'Besplatno' : `${deliveryCost.toLocaleString('sr-RS')} RSD`}</span>
        </div>
        <div className="checkout-summary-total">
          <span>Ukupno:</span>
          <span>{totalPrice.toLocaleString('sr-RS')} RSD</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
