import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'wouter';
import { db } from '../data/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './ProfilePage.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLocation('/login');
      return;
    }
    const fetchUserData = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setForm({
          name: docSnap.data().name || '',
          surname: docSnap.data().surname || '',
          phone: docSnap.data().phone || '',
          street: docSnap.data().address?.street || '',
          number: docSnap.data().address?.number || '',
          postalCode: docSnap.data().address?.postalCode || '',
          city: docSnap.data().address?.city || '',
        });
      }
    };
    fetchUserData();
  }, [user, setLocation]);

  if (!user) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateDoc(doc(db, "users", user.uid), {
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        address: {
          street: form.street,
          number: form.number,
          postalCode: form.postalCode,
          city: form.city,
        },
      });
      setSuccess('Podaci su uspešno sačuvani.');
      setEditMode(false);
      setUserData({
        ...userData,
        name: form.name,
        surname: form.surname,
        phone: form.phone,
        address: {
          street: form.street,
          number: form.number,
          postalCode: form.postalCode,
          city: form.city,
        },
      });
    } catch (err) {
      setError('Greška pri čuvanju: ' + err.message);
    }
  };

  return (
    <div className="profile-page-container">
      <h2>Moj profil</h2>
      <div className="profile-card">
        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>
          {editMode ? (
            <form onSubmit={handleSave} className="profile-form">
              <label>Ime</label>
              <input name="name" value={form.name} onChange={handleChange} />
              <label>Prezime</label>
              <input name="surname" value={form.surname} onChange={handleChange} />
              <label>Telefon</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
              <label>Ulica</label>
              <input name="street" value={form.street} onChange={handleChange} />
              <label>Broj</label>
              <input name="number" value={form.number} onChange={handleChange} />
              <label>Poštanski broj</label>
              <input name="postalCode" value={form.postalCode} onChange={handleChange} />
              <label>Grad</label>
              <input name="city" value={form.city} onChange={handleChange} />
              <button type="submit">Sačuvaj</button>
              <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>Otkaži</button>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
            </form>
          ) : (
            <>
              <p><strong>Ime:</strong> {userData?.name}</p>
              <p><strong>Prezime:</strong> {userData?.surname}</p>
              <p><strong>Telefon:</strong> {userData?.phone}</p>
              <p><strong>Adresa:</strong> {userData?.address?.street} {userData?.address?.number}, {userData?.address?.postalCode} {userData?.address?.city}</p>
              <button onClick={() => setEditMode(true)}>Izmeni podatke</button>
            </>
          )}
        </div>
        <button className="logout-btn" onClick={() => { logout(); setLocation('/'); }}>
          Odjavi se
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;