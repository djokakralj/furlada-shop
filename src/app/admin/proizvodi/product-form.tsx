'use client';

import { ArrowLeft, ArrowRight, ImagePlus, Link2, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { saveProduct, uploadImages, type ProductInput } from '@/app/actions/admin';
import { useToast } from '@/components/providers/toast';
import { TextField } from '@/components/ui/text-field';
import type { Subcategory } from '@/db/schema';
import { CATEGORY_LABEL, COLORS, GENDER_LABEL } from '@/lib/constants';
import { capitalize, cx, formatPrice, omit } from '@/lib/utils';
import ui from '../ui.module.css';
import styles from './product-form.module.css';

export type ProductFormValues = {
  name: string;
  description: string;
  details: string;
  brand: string;
  price: string;
  compareAtPrice: string;
  subcategoryId: string;
  gender: 'zene' | 'muskarci' | 'unisex';
  color: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  active: boolean;
};

const EMPTY_PRODUCT: ProductFormValues = {
  name: '',
  description: '',
  details: '',
  brand: '',
  price: '',
  compareAtPrice: '',
  subcategoryId: '',
  gender: 'unisex',
  color: '',
  sizes: [],
  images: [],
  featured: false,
  active: true,
};

export function ProductForm({
  id,
  initial,
  subcategories,
}: {
  id: string | null;
  initial?: ProductFormValues;
  subcategories: Subcategory[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [v, setV] = useState(initial ?? EMPTY_PRODUCT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSave] = useTransition();
  const [uploading, startUpload] = useTransition();
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const sub = subcategories.find((s) => String(s.id) === v.subcategoryId);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setV((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => omit(prev, key));
  };

  const onText = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(e.target.name as keyof ProductFormValues, e.target.value as never);

  const changeSubcategory = (value: string) => {
    const next = subcategories.find((s) => String(s.id) === value);
    setV((prev) => ({
      ...prev,
      subcategoryId: value,
      // zadrži samo boje/veličine koje nova vrsta dozvoljava
      color: next?.colors.includes(prev.color) ? prev.color : '',
      sizes: next ? prev.sizes.filter((s) => next.sizes.includes(s)) : [],
    }));
    setErrors((prev) => omit(prev, 'subcategoryId', 'color', 'sizes'));
  };

  const toggleSize = (size: string) =>
    set('sizes', v.sizes.includes(size) ? v.sizes.filter((s) => s !== size) : [...v.sizes, size]);

  const upload = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    const fd = new FormData();
    list.slice(0, 10).forEach((f) => fd.append('files', f));
    startUpload(async () => {
      const res = await uploadImages(fd);
      if (res.ok) {
        setV((prev) => ({ ...prev, images: [...prev.images, ...res.data.urls].slice(0, 10) }));
        setErrors((prev) => omit(prev, 'images'));
      } else {
        showToast(res.error ?? 'Greška pri otpremanju.', 'error');
      }
    });
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!/^https:\/\/images\.unsplash\.com\//.test(url)) {
      showToast('Podržani su samo linkovi sa images.unsplash.com (ostale slike otpremite).', 'error');
      return;
    }
    set('images', [...v.images, url].slice(0, 10));
    setUrlInput('');
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...v.images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set('images', next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ProductInput = {
      ...v,
      price: v.price,
      compareAtPrice: v.compareAtPrice || undefined,
      subcategoryId: v.subcategoryId,
      details: v.details || undefined,
      brand: v.brand || undefined,
    };
    startSave(async () => {
      const res = await saveProduct(id, payload);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        showToast(res.error ?? 'Proverite označena polja.', 'error');
        return;
      }
      showToast(id ? 'Izmene su sačuvane.' : `Proizvod „${v.name}“ je dodat.`);
      if (id) router.refresh();
      else router.push('/admin/proizvodi');
    });
  };

  const price = Number(v.price) || 0;
  const oldPrice = Number(v.compareAtPrice) || 0;

  return (
    <form onSubmit={submit} className={styles.layout} noValidate>
      <div className={styles.main}>
        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Osnovni podaci</h2>
          </div>
          <div className={cx(ui.cardBody, styles.stack)}>
            <TextField label="Naziv" name="name" value={v.name} onChange={onText} error={errors.name} placeholder="npr. Lanena košulja" />
            <TextField
              label="Opis"
              name="description"
              value={v.description}
              onChange={onText}
              error={errors.description}
              multiline
              placeholder="Kratak opis koji kupac vidi na stranici proizvoda"
            />
            <TextField
              label="Sastav i održavanje"
              name="details"
              value={v.details}
              onChange={onText}
              multiline
              optional
              hint="Svaki red je posebna stavka, npr. „100% pamuk“."
            />
            <TextField label="Brend" name="brand" value={v.brand} onChange={onText} optional />
          </div>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Slike</h2>
            <span className={ui.small}>Prva slika je glavna. Do 10 slika.</span>
          </div>
          <div className={cx(ui.cardBody, styles.stack)}>
            {v.images.length > 0 && (
              <ul className={styles.images}>
                {v.images.map((src, i) => (
                  <li key={src}>
                    <Image src={src} alt="" fill sizes="140px" />
                    {i === 0 && (
                      <span className={styles.mainBadge}>
                        <Star size={11} /> Glavna
                      </span>
                    )}
                    <div className={styles.imageTools}>
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Pomeri levo">
                        <ArrowLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === v.images.length - 1}
                        aria-label="Pomeri desno"
                      >
                        <ArrowRight size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => set('images', v.images.filter((_, j) => j !== i))}
                        aria-label="Ukloni sliku"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div
              className={cx(styles.dropzone, dragOver && styles.dropzoneActive)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                upload(e.dataTransfer.files);
              }}
              onClick={() => fileInput.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
            >
              <ImagePlus size={26} strokeWidth={1.4} />
              <strong>{uploading ? 'Otpremanje…' : 'Prevucite slike ovde ili kliknite za izbor'}</strong>
              <span>JPG, PNG, WebP ili AVIF, do 8 MB po slici. Slike se automatski smanjuju i optimizuju.</span>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) upload(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            <div className={styles.urlRow}>
              <Link2 size={16} />
              <input
                className="input"
                placeholder="ili nalepite link sa images.unsplash.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUrl();
                  }
                }}
              />
              <button type="button" className="btn btn-outline btn-sm" onClick={addUrl} disabled={!urlInput.trim()}>
                Dodaj
              </button>
            </div>
          </div>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Vrsta, boja i veličine</h2>
          </div>
          <div className={cx(ui.cardBody, styles.stack)}>
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="pf-sub">
                  Vrsta proizvoda
                </label>
                <select
                  id="pf-sub"
                  className="select"
                  value={v.subcategoryId}
                  onChange={(e) => changeSubcategory(e.target.value)}
                  aria-invalid={!!errors.subcategoryId}
                >
                  <option value="">Izaberite…</option>
                  {(['odeca', 'aksesoari'] as const).map((cat) => (
                    <optgroup key={cat} label={CATEGORY_LABEL[cat]}>
                      {subcategories
                        .filter((s) => s.category === cat)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {errors.subcategoryId && <span className="field-error">{errors.subcategoryId}</span>}
              </div>
              <div className="field">
                <label className="label" htmlFor="pf-gender">
                  Pol
                </label>
                <select
                  id="pf-gender"
                  className="select"
                  value={v.gender}
                  onChange={(e) => set('gender', e.target.value as ProductFormValues['gender'])}
                >
                  {(Object.keys(GENDER_LABEL) as ProductFormValues['gender'][]).map((g) => (
                    <option key={g} value={g}>
                      {GENDER_LABEL[g]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!sub ? (
              <p className={styles.hint}>Izaberite vrstu da biste videli dostupne boje i veličine.</p>
            ) : (
              <>
                <div className="field">
                  <span className="label">Boja</span>
                  <div className={styles.chips}>
                    {sub.colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={cx(styles.chip, v.color === c && styles.chipActive)}
                        onClick={() => set('color', c)}
                        aria-pressed={v.color === c}
                      >
                        <span className="color-dot" style={{ background: COLORS[c] ?? '#ccc' }} />
                        {capitalize(c)}
                      </button>
                    ))}
                  </div>
                  {errors.color && <span className="field-error">{errors.color}</span>}
                </div>

                {sub.sizes.length > 0 ? (
                  <div className="field">
                    <span className="label">
                      Veličine{' '}
                      <button
                        type="button"
                        className={styles.selectAll}
                        onClick={() => set('sizes', v.sizes.length === sub.sizes.length ? [] : [...sub.sizes])}
                      >
                        {v.sizes.length === sub.sizes.length ? 'poništi sve' : 'izaberi sve'}
                      </button>
                    </span>
                    <div className={styles.chips}>
                      {sub.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={cx(styles.chip, styles.sizeChip, v.sizes.includes(s) && styles.chipActive)}
                          onClick={() => toggleSize(s)}
                          aria-pressed={v.sizes.includes(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {errors.sizes && <span className="field-error">{errors.sizes}</span>}
                  </div>
                ) : (
                  <p className={styles.hint}>Ova vrsta nema veličine.</p>
                )}
                <p className={styles.hint}>
                  Ponuđene boje i veličine podešavaju se u delu{' '}
                  <Link href="/admin/vrste" className="link">
                    Vrste i atributi
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        </section>
      </div>

      <aside className={styles.side}>
        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Cena</h2>
          </div>
          <div className={cx(ui.cardBody, styles.stack)}>
            <TextField
              label="Cena (RSD)"
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              value={v.price}
              onChange={onText}
              error={errors.price}
            />
            <TextField
              label="Stara cena (RSD)"
              name="compareAtPrice"
              type="number"
              inputMode="numeric"
              min={0}
              value={v.compareAtPrice}
              onChange={onText}
              error={errors.compareAtPrice}
              optional
              hint="Popunite samo za akciju — prikazuje se precrtana."
            />
            {price > 0 && oldPrice > price && (
              <p className={styles.discount}>
                Popust {Math.round((1 - price / oldPrice) * 100)}% — ušteda {formatPrice(oldPrice - price)}
              </p>
            )}
          </div>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Vidljivost</h2>
          </div>
          <div className={cx(ui.cardBody, styles.stack)}>
            <label className={styles.toggleRow}>
              <button
                type="button"
                className={cx(ui.switch, v.active && ui.switchOn)}
                onClick={() => set('active', !v.active)}
                aria-pressed={v.active}
              />
              <span>
                <strong>Aktivan</strong>
                <small>Vidljiv u prodavnici i može se poručiti</small>
              </span>
            </label>
            <label className={styles.toggleRow}>
              <button
                type="button"
                className={cx(ui.switch, v.featured && ui.switchOn)}
                onClick={() => set('featured', !v.featured)}
                aria-pressed={v.featured}
              />
              <span>
                <strong>Izdvojen</strong>
                <small>Prikazuje se u sekciji „Izdvajamo“ na početnoj</small>
              </span>
            </label>
          </div>
        </section>

        <div className={styles.saveBar}>
          <button type="submit" className="btn btn-block" disabled={saving || uploading}>
            {saving ? 'Čuvanje…' : id ? 'Sačuvaj izmene' : 'Dodaj proizvod'}
          </button>
          <Link href="/admin/proizvodi" className="btn btn-ghost btn-block">
            Otkaži
          </Link>
        </div>
      </aside>
    </form>
  );
}
