import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { X, Plus } from 'lucide-react';
import { db } from '../../data/firebase';
import { useToast } from '../../components/Toast';
import {
  colorTranslationMap,
  odecaKategorije,
  aksesoariKategorije,
  FORM_SIZES,
} from '../../data/constants';

const CATEGORY_SECTIONS = [
  { label: 'Odeća', category: 'odeca', subcategories: odecaKategorije },
  { label: 'Aksesoari', category: 'aksesoari', subcategories: aksesoariKategorije },
];

const ALL_COLORS = Object.keys(colorTranslationMap);

// Podrazumevane vrednosti kad podkategorija još nema svoj zapis u bazi
const defaultsFor = (category) => ({
  sizes: category === 'odeca' ? [...FORM_SIZES] : [],
  colors: [...ALL_COLORS],
});

function AdminAttributes() {
  const { showToast } = useToast();
  const [attrs, setAttrs] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { name, category }
  const [draft, setDraft] = useState(null);       // { sizes, colors }
  const [newSize, setNewSize] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAttrs() {
      try {
        const snap = await getDocs(collection(db, 'attributes'));
        const map = {};
        snap.forEach(d => { map[d.id] = d.data(); });
        setAttrs(map);
      } catch (err) {
        console.error('Greška pri učitavanju atributa:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttrs();
  }, []);

  const selectSubcategory = (name, category) => {
    setSelected({ name, category });
    const existing = attrs[name];
    setDraft({
      sizes: existing?.sizes ? [...existing.sizes] : defaultsFor(category).sizes,
      colors: existing?.colors ? [...existing.colors] : defaultsFor(category).colors,
    });
    setNewSize('');
  };

  const addSize = () => {
    const sz = newSize.trim().toUpperCase();
    if (!sz) return;
    if (draft.sizes.includes(sz)) {
      showToast(`Veličina ${sz} već postoji.`, 'error');
      return;
    }
    setDraft(d => ({ ...d, sizes: [...d.sizes, sz] }));
    setNewSize('');
  };

  const removeSize = (sz) => {
    setDraft(d => ({ ...d, sizes: d.sizes.filter(s => s !== sz) }));
  };

  const toggleColor = (color) => {
    setDraft(d => ({
      ...d,
      colors: d.colors.includes(color)
        ? d.colors.filter(c => c !== color)
        : [...d.colors, color],
    }));
  };

  const handleSave = async () => {
    if (saving || !selected) return;
    if (draft.colors.length === 0) {
      showToast('Izaberite bar jednu boju.', 'error');
      return;
    }
    setSaving(true);
    try {
      const data = {
        category: selected.category,
        subcategory: selected.name,
        sizes: draft.sizes,
        colors: draft.colors,
      };
      await setDoc(doc(db, 'attributes', selected.name), data);
      setAttrs(prev => ({ ...prev, [selected.name]: data }));
      showToast(`Atributi za "${selected.name}" su sačuvani.`);
    } catch (error) {
      console.error('Greška pri čuvanju atributa:', error);
      showToast('Greška pri čuvanju atributa.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="admin-loading">Učitavanje...</p>;

  return (
    <>
      <h1 className="admin-page-title">Atributi proizvoda</h1>
      <p className="admin-page-subtitle">
        Za svaku vrstu proizvoda definišite dostupne veličine i boje.
        Forma za dodavanje proizvoda nudi samo ovde izabrane vrednosti.
      </p>

      {CATEGORY_SECTIONS.map(({ label, category, subcategories }) => (
        <div className="admin-card" key={category}>
          <div className="admin-card-header">
            <h2>{label}</h2>
          </div>
          <div className="admin-subcat-grid">
            {subcategories.map(name => {
              const set = attrs[name];
              const isActive = selected?.name === name;
              return (
                <button
                  key={name}
                  type="button"
                  className={`admin-subcat-btn${isActive ? ' active' : ''}`}
                  onClick={() => selectSubcategory(name, category)}
                >
                  <span className="admin-subcat-name">{name}</span>
                  <span className="admin-subcat-meta">
                    {set
                      ? `${set.colors?.length || 0} boja · ${set.sizes?.length || 0} veličina`
                      : 'podrazumevano'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selected && draft && (
        <div className="admin-card admin-attr-editor">
          <div className="admin-card-header">
            <h2>{selected.name}</h2>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Čuvanje...' : 'Sačuvaj'}
            </button>
          </div>

          {/* Veličine */}
          <div className="admin-attr-section">
            <label className="admin-attr-label">
              Veličine {draft.sizes.length === 0 && <span className="admin-attr-hint">(bez veličina — npr. za aksesoare)</span>}
            </label>
            <div className="admin-attr-chips">
              {draft.sizes.map(sz => (
                <span key={sz} className="admin-attr-chip">
                  {sz}
                  <button type="button" onClick={() => removeSize(sz)} aria-label={`Ukloni ${sz}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="admin-attr-add">
              <input
                type="text"
                placeholder="npr. XXL ili 32"
                value={newSize}
                onChange={e => setNewSize(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSize(); } }}
              />
              <button type="button" className="admin-primary-btn" onClick={addSize}>
                <Plus size={14} /> Dodaj
              </button>
            </div>
          </div>

          {/* Boje */}
          <div className="admin-attr-section">
            <label className="admin-attr-label">
              Boje <span className="admin-attr-hint">({draft.colors.length} izabrano — klik uključuje/isključuje)</span>
            </label>
            <div className="admin-attr-chips">
              {ALL_COLORS.map(color => {
                const active = draft.colors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    className={`admin-color-chip${active ? ' active' : ''}`}
                    onClick={() => toggleColor(color)}
                  >
                    <span
                      className="admin-color-dot"
                      style={{ background: colorTranslationMap[color] }}
                    />
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminAttributes;
