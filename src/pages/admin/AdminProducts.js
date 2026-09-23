import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Trash2, Plus } from 'lucide-react';
import { db } from '../../data/firebase';
import { useToast } from '../../components/Toast';
import {
  colorTranslationMap,
  odecaKategorije,
  aksesoariKategorije,
  FORM_SIZES,
  NO_IMAGE,
} from '../../data/constants';

const EMPTY_FORM = {
  name: '',
  price: '',
  description: '',
  category: 'odeca',
  subcategory: '',
  color: '',
  gender: 'unisex',
  imageUrl: '',
};

function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sizes, setSizes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // Atributi po podkategoriji (veličine/boje definisane u /admin/atributi)
  const [attributeSets, setAttributeSets] = useState({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Greška pri učitavanju proizvoda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    getDocs(collection(db, 'attributes'))
      .then(snap => {
        const map = {};
        snap.forEach(d => { map[d.id] = d.data(); });
        setAttributeSets(map);
      })
      .catch(err => console.error('Greška pri učitavanju atributa:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
      // Promena kategorije resetuje podkategoriju, a promena vrste boju
      ...(name === 'category' ? { subcategory: '', color: '' } : {}),
      ...(name === 'subcategory' ? { color: '' } : {}),
    }));
    if (name === 'category' || name === 'subcategory') setSizes([]);
  };

  const toggleSize = (sz) => {
    setSizes(prev => prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]);
  };

  // Veličine/boje za izabranu vrstu — iz /admin/atributi, sa fallbackom na podrazumevane
  const attrSet = form.subcategory ? attributeSets[form.subcategory] : null;
  const availableSizes = attrSet
    ? attrSet.sizes || []
    : form.category === 'odeca' ? FORM_SIZES : [];
  const availableColors = attrSet?.colors?.length
    ? attrSet.colors
    : Object.keys(colorTranslationMap);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name || !form.price || !form.description || !form.color || !form.subcategory) {
      showToast('Popunite sva polja!', 'error');
      return;
    }
    if (availableSizes.length > 0 && sizes.length === 0) {
      showToast('Izaberite bar jednu veličinu!', 'error');
      return;
    }
    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        color: form.color,
        gender: form.gender,
        sizes: availableSizes.length > 0 ? sizes : [],
        imageUrl: form.imageUrl.trim(),
      });
      await updateDoc(docRef, { id: docRef.id });
      setForm(EMPTY_FORM);
      setSizes([]);
      showToast(`Proizvod "${form.name}" je dodat.`);
      fetchProducts();
    } catch (error) {
      console.error('Greška prilikom dodavanja proizvoda:', error);
      showToast('Greška prilikom dodavanja proizvoda.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Obrisati proizvod "${product.name}"? Ova akcija je trajna.`)) return;
    try {
      await deleteDoc(doc(db, 'products', String(product.id)));
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast(`Proizvod "${product.name}" je obrisan.`);
    } catch (error) {
      console.error('Greška pri brisanju proizvoda:', error);
      showToast('Greška pri brisanju proizvoda.', 'error');
    }
  };

  const subcategories = form.category === 'odeca' ? odecaKategorije : aksesoariKategorije;

  const filteredProducts = search.trim()
    ? products.filter(p =>
        p.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
        p.subcategory?.toLowerCase().includes(search.trim().toLowerCase())
      )
    : products;

  return (
    <>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Proizvodi</h1>
        <button
          type="button"
          className="admin-primary-btn"
          onClick={() => setFormOpen(o => !o)}
        >
          <Plus size={15} />
          {formOpen ? 'Zatvori formu' : 'Novi proizvod'}
        </button>
      </div>

      {/* ── Forma za dodavanje ── */}
      {formOpen && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Dodaj novi proizvod</h2>
          </div>
          <form className="admin-form" onSubmit={handleAddProduct}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="ap-name">Naziv</label>
                <input id="ap-name" name="name" type="text" placeholder="npr. Lanena košulja" value={form.name} onChange={handleChange} />
              </div>
              <div className="admin-field">
                <label htmlFor="ap-price">Cena (RSD)</label>
                <input id="ap-price" name="price" type="number" min="0" placeholder="npr. 3500" value={form.price} onChange={handleChange} />
              </div>
              <div className="admin-field admin-field--full">
                <label htmlFor="ap-desc">Opis</label>
                <textarea id="ap-desc" name="description" placeholder="Kratak opis proizvoda" value={form.description} onChange={handleChange} />
              </div>
              <div className="admin-field admin-field--full">
                <label htmlFor="ap-image">URL slike</label>
                <input id="ap-image" name="imageUrl" type="url" placeholder="https://..." value={form.imageUrl} onChange={handleChange} />
                {form.imageUrl.trim() && (
                  <img
                    src={form.imageUrl}
                    alt="Pregled"
                    className="admin-image-preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = 'block'; }}
                  />
                )}
              </div>
              <div className="admin-field">
                <label htmlFor="ap-category">Kategorija</label>
                <select id="ap-category" name="category" value={form.category} onChange={handleChange}>
                  <option value="odeca">Odeća</option>
                  <option value="aksesoari">Aksesoari</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="ap-subcategory">Podkategorija</label>
                <select id="ap-subcategory" name="subcategory" value={form.subcategory} onChange={handleChange}>
                  <option value="">Izaberite podkategoriju</option>
                  {subcategories.map(pk => (
                    <option key={pk} value={pk}>{pk}</option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="ap-gender">Pol</label>
                <select id="ap-gender" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="zene">Žene</option>
                  <option value="muskarci">Muškarci</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="ap-color">Boja</label>
                <select id="ap-color" name="color" value={form.color} onChange={handleChange}>
                  <option value="">Izaberite boju</option>
                  {availableColors.map(colorKey => (
                    <option key={colorKey} value={colorKey}>
                      {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {availableSizes.length > 0 && (
                <div className="admin-field admin-field--full">
                  <label>Veličine</label>
                  <div className="admin-size-pills">
                    {availableSizes.map(sz => (
                      <button
                        key={sz}
                        type="button"
                        className={`admin-size-pill${sizes.includes(sz) ? ' active' : ''}`}
                        onClick={() => toggleSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="admin-primary-btn admin-form-submit" disabled={saving}>
              {saving ? 'Čuvanje...' : 'Dodaj proizvod'}
            </button>
          </form>
        </div>
      )}

      {/* ── Lista proizvoda ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Svi proizvodi ({filteredProducts.length})</h2>
          <input
            type="text"
            className="admin-search"
            placeholder="Pretraži po nazivu ili podkategoriji"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="admin-loading">Učitavanje...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="admin-empty">
            {search ? 'Nema proizvoda za ovu pretragu.' : 'Još uvek nema proizvoda.'}
          </p>
        ) : (
          <div className="admin-product-list">
            {filteredProducts.map(product => (
              <div key={product.id} className="admin-product-row">
                <img
                  src={product.imageUrl || NO_IMAGE}
                  alt={product.name}
                  className="admin-product-thumb"
                  onError={(e) => { e.target.src = NO_IMAGE; }}
                />
                <div className="admin-product-info">
                  <span className="admin-product-name">{product.name}</span>
                  <span className="admin-product-meta">
                    {product.category === 'odeca' ? 'Odeća' : 'Aksesoari'}
                    {product.subcategory ? ` · ${product.subcategory}` : ''}
                    {product.color ? ` · ${product.color}` : ''}
                    {Array.isArray(product.sizes) && product.sizes.length > 0
                      ? ` · ${product.sizes.join(', ')}`
                      : ''}
                  </span>
                </div>
                <span className="admin-product-price">
                  {Number(product.price).toLocaleString('sr-RS')} RSD
                </span>
                <button
                  type="button"
                  className="admin-delete-btn"
                  onClick={() => handleDeleteProduct(product)}
                  aria-label={`Obriši ${product.name}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminProducts;
