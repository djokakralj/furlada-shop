import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import './AdminPage.css';

function AdminPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Učitaj proizvode iz Firestore-a
  const fetchProducts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'products'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    setProducts(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Dodaj novi proizvod bez slike
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !description) {
      alert('Popunite sva polja!');
      return;
    }

    await addDoc(collection(db, 'products'), {
      name,
      price: Number(price),
      description,
      imageUrl: '', // prazno polje za sliku
    });

    setName('');
    setPrice('');
    setDescription('');
    fetchProducts();
  };

  // Obriši proizvod
  const handleDeleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
    setProducts(products.filter((p) => p.id !== id));
  };

  if (!isAdmin) return <p>Pristup dozvoljen samo administratorima.</p>;

  return (
    <div className="admin-panel-container">
      <h2>Admin Panel</h2>
      <h3>Dodaj novi proizvod</h3>
      <form onSubmit={handleAddProduct} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Ime proizvoda"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Cena"
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
        <textarea
          placeholder="Opis"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button type="submit">Dodaj proizvod</button>
      </form>

      <h3>Lista proizvoda</h3>
      {loading ? (
        <p>Učitavanje...</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {/* Slika je prazna, možeš kasnije vratiti */}
              <strong>{product.name}</strong> - {product.price} RSD
              <button
                className="delete-btn"
                onClick={() => handleDeleteProduct(product.id)}
              >
                Obriši
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminPage;