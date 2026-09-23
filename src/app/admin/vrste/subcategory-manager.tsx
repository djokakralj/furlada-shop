'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteSubcategory, saveSubcategory } from '@/app/actions/admin';
import { useToast } from '@/components/providers/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TextField } from '@/components/ui/text-field';
import type { Category, Subcategory } from '@/db/schema';
import { ALL_COLORS, CATEGORY_LABEL, COLORS, DEFAULT_CLOTHING_SIZES } from '@/lib/constants';
import { capitalize, cx } from '@/lib/utils';
import ui from '../ui.module.css';
import styles from './subcategories.module.css';

type Row = Subcategory & { productCount: number };
type Draft = { id: number | null; name: string; category: Category; sizes: string[]; colors: string[]; position: string };

const newDraft = (category: Category, position: number): Draft => ({
  id: null,
  name: '',
  category,
  sizes: category === 'odeca' ? [...DEFAULT_CLOTHING_SIZES] : [],
  colors: [...ALL_COLORS],
  position: String(position),
});

export function SubcategoryManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSize, setNewSize] = useState('');
  const [saving, startSave] = useTransition();
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [deletePending, startDelete] = useTransition();

  const edit = (r: Row) => {
    setDraft({ id: r.id, name: r.name, category: r.category, sizes: [...r.sizes], colors: [...r.colors], position: String(r.position) });
    setErrors({});
    setNewSize('');
  };

  const addSize = () => {
    const s = newSize.trim().toUpperCase();
    if (!s || !draft) return;
    if (draft.sizes.includes(s)) {
      showToast(`Veličina ${s} već postoji.`, 'error');
      return;
    }
    setDraft({ ...draft, sizes: [...draft.sizes, s] });
    setNewSize('');
  };

  const save = () => {
    if (!draft) return;
    startSave(async () => {
      const res = await saveSubcategory(draft.id, draft);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        showToast(res.error ?? 'Greška pri čuvanju.', 'error');
        return;
      }
      showToast(`Vrsta „${draft.name}“ je sačuvana.`);
      setDraft(null);
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    startDelete(async () => {
      const res = await deleteSubcategory(deleting.id);
      if (res.ok) {
        showToast(`Vrsta „${deleting.name}“ je obrisana.`);
        setDeleting(null);
        router.refresh();
      } else {
        showToast(res.error ?? 'Greška pri brisanju.', 'error');
        setDeleting(null);
      }
    });
  };

  return (
    <div className={styles.layout}>
      <div className={styles.lists}>
        {(['odeca', 'aksesoari'] as const).map((cat) => {
          const list = rows.filter((r) => r.category === cat);
          return (
            <section key={cat} className={ui.card}>
              <div className={ui.cardHead}>
                <h2>{CATEGORY_LABEL[cat]}</h2>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setDraft(newDraft(cat, list.length));
                    setErrors({});
                  }}
                >
                  <Plus size={14} /> Nova vrsta
                </button>
              </div>
              <ul className={styles.list}>
                {list.map((r) => (
                  <li key={r.id} className={cx(draft?.id === r.id && styles.selected)}>
                    <div className={styles.info}>
                      <strong>{r.name}</strong>
                      <span className={ui.small}>
                        {r.productCount} {r.productCount === 1 ? 'proizvod' : 'proizvoda'} ·{' '}
                        {r.sizes.length ? r.sizes.join(', ') : 'bez veličina'}
                      </span>
                      <span className={styles.dots}>
                        {r.colors.slice(0, 14).map((c) => (
                          <span key={c} className="color-dot" style={{ background: COLORS[c] ?? '#ccc' }} title={c} />
                        ))}
                        {r.colors.length > 14 && <span className={ui.small}>+{r.colors.length - 14}</span>}
                      </span>
                    </div>
                    <div className={ui.actions}>
                      <button type="button" className={ui.iconBtn} onClick={() => edit(r)} aria-label={`Izmeni ${r.name}`}>
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className={cx(ui.iconBtn, ui.iconBtnDanger)}
                        onClick={() => setDeleting(r)}
                        aria-label={`Obriši ${r.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <aside className={styles.editor}>
        {!draft ? (
          <div className={cx(ui.card, styles.placeholder)}>
            <Pencil size={22} strokeWidth={1.4} />
            <p>Izaberite vrstu za izmenu ili dodajte novu.</p>
          </div>
        ) : (
          <section className={ui.card}>
            <div className={ui.cardHead}>
              <h2>{draft.id ? 'Izmena vrste' : 'Nova vrsta'}</h2>
              <button type="button" className={ui.iconBtn} onClick={() => setDraft(null)} aria-label="Zatvori">
                <X size={16} />
              </button>
            </div>
            <div className={styles.editorBody}>
              <TextField
                label="Naziv"
                name="name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                error={errors.name}
                placeholder="npr. Kardigani"
              />
              <div className="form-grid">
                <div className="field">
                  <label className="label" htmlFor="sc-cat">
                    Kategorija
                  </label>
                  <select
                    id="sc-cat"
                    className="select"
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}
                  >
                    <option value="odeca">Odeća</option>
                    <option value="aksesoari">Aksesoari</option>
                  </select>
                </div>
                <TextField
                  label="Redosled"
                  name="position"
                  type="number"
                  min={0}
                  value={draft.position}
                  onChange={(e) => setDraft({ ...draft, position: e.target.value })}
                  hint="Manji broj = ranije u meniju"
                />
              </div>

              <div className="field">
                <span className="label">Veličine</span>
                <div className={styles.chips}>
                  {draft.sizes.length === 0 && <span className={ui.small}>Bez veličina (npr. za tašne).</span>}
                  {draft.sizes.map((s) => (
                    <span key={s} className={styles.sizeChip}>
                      {s}
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, sizes: draft.sizes.filter((x) => x !== s) })}
                        aria-label={`Ukloni ${s}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className={styles.addRow}>
                  <input
                    className="input"
                    placeholder="npr. XXL, 38 ili S/M"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSize();
                      }
                    }}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addSize}>
                    Dodaj
                  </button>
                </div>
              </div>

              <div className="field">
                <span className="label">
                  Boje ({draft.colors.length}){' '}
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() =>
                      setDraft({ ...draft, colors: draft.colors.length === ALL_COLORS.length ? [] : [...ALL_COLORS] })
                    }
                  >
                    {draft.colors.length === ALL_COLORS.length ? 'poništi sve' : 'izaberi sve'}
                  </button>
                </span>
                <div className={styles.chips}>
                  {ALL_COLORS.map((c) => {
                    const on = draft.colors.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        className={cx(styles.colorChip, on && styles.colorChipOn)}
                        onClick={() =>
                          setDraft({ ...draft, colors: on ? draft.colors.filter((x) => x !== c) : [...draft.colors, c] })
                        }
                        aria-pressed={on}
                      >
                        <span className="color-dot" style={{ background: COLORS[c] }} />
                        {capitalize(c)}
                      </button>
                    );
                  })}
                </div>
                {errors.colors && <span className="field-error">{errors.colors}</span>}
              </div>

              <button type="button" className="btn btn-block" onClick={save} disabled={saving}>
                {saving ? 'Čuvanje…' : 'Sačuvaj'}
              </button>
            </div>
          </section>
        )}
      </aside>

      <ConfirmDialog
        open={!!deleting}
        title="Obrisati vrstu?"
        message={
          deleting && deleting.productCount > 0 ? (
            <>
              Vrsta <strong>{deleting.name}</strong> ima {deleting.productCount} proizvoda i ne može se obrisati dok ih ne
              premestite u drugu vrstu.
            </>
          ) : (
            <>
              Vrsta <strong>{deleting?.name}</strong> biće trajno obrisana.
            </>
          )
        }
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
