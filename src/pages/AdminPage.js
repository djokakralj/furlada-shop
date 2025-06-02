import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';
import './AdminPage.css';

function AdminPage() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState('products');
  
  // Proizvodi
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('odeca');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [color, setColor] = useState('');
  const [sizes, setSizes] = useState([]);

  // Porudžbine
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Učitaj proizvode iz Firestore-a
  const fetchProducts = async () => {
    setLoadingProducts(true);
    const querySnapshot = await getDocs(collection(db, 'products'));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    setProducts(items);
    setLoadingProducts(false);
  };

  // Učitaj porudžbine iz Firestore-a
  const fetchOrders = async () => {
    setLoadingOrders(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    setOrders(items);
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (tab === 'products') fetchProducts();
    if (tab === 'orders') fetchOrders();
    // eslint-disable-next-line
  }, [tab]);


const colorTranslationMap = {
  crvena: '#f2111c',
  plava: '#13187d',
  zelena: '#7fc24b',
  žuta: '#f2ff00',
  narandžasta: '#ff8000',
  ljubičasta: '#800080',
  bela: '#ffffff',
  crna: '#000000',
  siva: '#aba9a9',
  roze: '#f76cf7',
  braon: '#914038',
  zlatna: '#ffd700',
  srebrna: '#c0c0c0',
  maslinasta: '#59704c',
  jeans: '#5d6d7e',
  tirkizna: '#48d1cc',
};

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !description || !category || !color) {
      alert('Popunite sva polja!');
      return;
    }
    if (category === 'odeca' && sizes.length === 0) {
      alert('Izaberite bar jednu veličinu za odeću!');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        name,
        price: Number(price),
        description,
        category,
        color,
        sizes: category === 'odeca' ? sizes : [],
        imageUrl: '',
      });

      await updateDoc(docRef, {
        id: docRef.id
      });

      setName('');
      setPrice('');
      setDescription('');
      setCategory('odeca');
      setColor('');
      setSizes([]);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product: ", error);
      alert('Greška prilikom dodavanja proizvoda');
    }
  };

  // Obriši proizvod
  const handleDeleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', String(id)));
      // Osveži listu proizvoda bez refresh-a
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Greška pri brisanju proizvoda:', error);
      alert('Greška pri brisanju proizvoda: ' + error.message);
    }
  };

  // Promeni status porudžbine (npr. ispunjena/neispunjena)
  const handleToggleOrderStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === 'ispunjena' ? 'primljena' : 'ispunjena';
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    setOrders(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  if (!isAdmin) return <p>Pristup dozvoljen samo administratorima.</p>;

  return (
    <div className="admin-panel-container">
      <h2>Admin Panel</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          className={tab === 'products' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('products')}
        >
          Proizvodi
        </button>
        <button
          className={tab === 'orders' ? 'admin-tab active' : 'admin-tab'}
          onClick={() => setTab('orders')}
        >
          Porudžbine
        </button>
      </div>

      {tab === 'products' && (
        <>
          <h3>Dodaj novi proizvod</h3>
          <form onSubmit={handleAddProduct} style={{ marginBottom: 24 }}>
  <input
    type="text"
    placeholder="Ime proizvoda"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
  <input
    type="number"
    placeholder="Cena"
    value={price}
    onChange={(e) => setPrice(e.target.value)}
  />
  <textarea
    placeholder="Opis"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
  <select
    value={color}
    onChange={(e) => setColor(e.target.value)}
    style={{
      width: '100%',
      padding: '8px',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
    }}
  >
    <option value="">Izaberite boju</option>
    {Object.keys(colorTranslationMap).map((colorKey) => (
      <option key={colorKey} value={colorKey}>
        {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
      </option>
    ))}
  </select>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    style={{
      width: '100%',
      padding: '8px',
      marginBottom: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
    }}
  >
    <option value="odeca">Odeća</option>
    <option value="aksesoari">Aksesoari</option>
  </select>
  {category === 'odeca' && (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>
        Veličine:
      </label>
      {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
        <label key={sz} style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            value={sz}
            checked={sizes.includes(sz)}
            onChange={(e) => {
              if (e.target.checked) {
                setSizes([...sizes, sz]);
              } else {
                setSizes(sizes.filter((s) => s !== sz));
              }
            }}
          />{' '}
          {sz}
        </label>
      ))}
    </div>
  )}
  <button type="submit">Dodaj proizvod</button>
</form>;

          <h3>Lista proizvoda</h3>
          {loadingProducts ? (
            <p>Učitavanje...</p>
          ) : (
            <ul>
              {products.map((product) => (
                <li key={product.id}>
                  <strong>{product.name}</strong> - {product.price} RSD
                  <span style={{ 
                    marginLeft: '10px',
                    color: '#666',
                    fontSize: '0.9em'
                  }}>
                    ({product.category || 'bez kategorije'})
                  </span>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDeleteProduct(String(product.id))}
                  >
                    Obriši
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'orders' && (
        <>
          <h3>Lista porudžbina</h3>
          {loadingOrders ? (
            <p>Učitavanje...</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order.id} className={`order-card${order.status === 'ispunjena' ? ' fulfilled' : ''}`}>
                  <div>
                    <strong>{order.customer?.name} {order.customer?.surname}</strong>
                  </div>
                  <div style={{ fontSize: '0.97em', color: '#444' }}>
                    {order.customer?.email} | {order.customer?.phone}
                  </div>
                  <div>
                    Adresa: {order.customer?.address?.street} {order.customer?.address?.number}, {order.customer?.address?.postalCode} {order.customer?.address?.city}
                  </div>
                  <div>
                    Način dostave: {order.delivery} | Plaćanje: {order.payment}
                  </div>
                  <div>
                    <strong>Proizvodi:</strong>
                    <ul>
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.name} ({item.quantity || 1} kom) - {item.price} RSD
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Ukupno:</strong> {order.total} RSD
                  </div>
                  <div style={{ fontSize: '0.95em', color: '#888', marginTop: 2 }}>
                    Status: {order.status || 'primljena'}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={order.status === 'ispunjena'}
                        onChange={() => handleToggleOrderStatus(order.id, order.status)}
                        style={{ marginRight: 8 }}
                      />
                      Ispunjena porudžbina
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;