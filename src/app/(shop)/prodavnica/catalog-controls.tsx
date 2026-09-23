'use client';

import { Check, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { COLORS, SORT_OPTIONS } from '@/lib/constants';
import type { CatalogFilters } from '@/lib/queries';
import { capitalize, cx, formatPrice } from '@/lib/utils';
import styles from './catalog.module.css';

type Facets = { colors: string[]; sizes: string[]; minPrice: number | null; maxPrice: number | null };

function Section({ title, children, count }: { title: string; children: React.ReactNode; count?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={styles.fSection}>
      <button type="button" className={styles.fHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>
          {title}
          {count ? <em>{count}</em> : null}
        </span>
        <ChevronDown size={16} className={cx(styles.fChevron, open && styles.fChevronOpen)} />
      </button>
      {open && <div className={styles.fBody}>{children}</div>}
    </div>
  );
}

export function CatalogControls({
  filters,
  facets,
  total,
  children,
}: {
  filters: CatalogFilters;
  facets: Facets;
  total: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(filters.min?.toString() ?? '');
  const [priceMax, setPriceMax] = useState(filters.max?.toString() ?? '');

  const update = (changes: Record<string, string | null>) => {
    const qs = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) qs.set(k, v);
      else qs.delete(k);
    }
    qs.delete('strana'); // svaka promena filtera vraća na početak
    startTransition(() => router.push(`${pathname}?${qs.toString()}`, { scroll: false }));
  };

  const toggleIn = (key: 'boja' | 'velicina', current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: next.join(',') || null });
  };

  const applyPrice = () => {
    update({ min: priceMin || null, max: priceMax || null });
  };

  const active: { label: string; clear: Record<string, string | null> }[] = [
    ...filters.colors.map((c) => ({
      label: capitalize(c),
      clear: { boja: filters.colors.filter((x) => x !== c).join(',') || null },
    })),
    ...filters.sizes.map((s) => ({
      label: `Veličina ${s}`,
      clear: { velicina: filters.sizes.filter((x) => x !== s).join(',') || null },
    })),
    ...(filters.min ? [{ label: `Od ${formatPrice(filters.min)}`, clear: { min: null } }] : []),
    ...(filters.max ? [{ label: `Do ${formatPrice(filters.max)}`, clear: { max: null } }] : []),
    ...(filters.sale ? [{ label: 'Na akciji', clear: { akcija: null } }] : []),
  ];

  const clearAll = () => {
    setPriceMin('');
    setPriceMax('');
    update({ boja: null, velicina: null, min: null, max: null, akcija: null });
  };

  const panel = (
    <>
      {facets.colors.length > 0 && (
        <Section title="Boja" count={filters.colors.length}>
          <div className={styles.colorList}>
            {facets.colors.map((c) => {
              const on = filters.colors.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  className={cx(styles.colorRow, on && styles.colorRowActive)}
                  onClick={() => toggleIn('boja', filters.colors, c)}
                  aria-pressed={on}
                >
                  <span className="color-dot" style={{ background: COLORS[c] ?? '#ccc' }} />
                  <span>{capitalize(c)}</span>
                  {on && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {facets.sizes.length > 0 && (
        <Section title="Veličina" count={filters.sizes.length}>
          <div className={styles.sizeGrid}>
            {facets.sizes.map((s) => {
              const on = filters.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  className={cx(styles.sizeBtn, on && styles.sizeBtnActive)}
                  onClick={() => toggleIn('velicina', filters.sizes, s)}
                  aria-pressed={on}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      <Section title="Cena">
        <form
          className={styles.priceRow}
          onSubmit={(e) => {
            e.preventDefault();
            applyPrice();
          }}
        >
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={facets.minPrice ? `od ${facets.minPrice}` : 'od'}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            aria-label="Najniža cena"
          />
          <span>—</span>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={facets.maxPrice ? `do ${facets.maxPrice}` : 'do'}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            aria-label="Najviša cena"
          />
        </form>
      </Section>

      <Section title="Ponuda">
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={!!filters.sale}
            onChange={(e) => update({ akcija: e.target.checked ? '1' : null })}
          />
          Samo proizvodi na akciji
        </label>
      </Section>
    </>
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="Filteri">
        {panel}
      </aside>

      <div className={styles.results}>
        <div className={styles.toolbar}>
          <button type="button" className={styles.filterBtn} onClick={() => setMobileOpen(true)}>
            <SlidersHorizontal size={16} />
            Filteri
            {active.length > 0 && <span className={styles.filterCount}>{active.length}</span>}
          </button>

          {active.length > 0 ? (
            <div className={styles.activeFilters}>
              {active.map((a) => (
                <button key={a.label} type="button" className={styles.activeChip} onClick={() => update(a.clear)}>
                  {a.label} <X size={12} />
                </button>
              ))}
              <button type="button" className={styles.clearAll} onClick={clearAll}>
                Obriši sve
              </button>
            </div>
          ) : (
            <span />
          )}

          <label className={styles.sort}>
            <span className="visually-hidden">Sortiranje</span>
            <select
              className="select"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value === 'preporuceno' ? null : e.target.value })}
            >
              {Object.entries(SORT_OPTIONS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={cx(styles.resultsBody, pending && styles.pending)} aria-busy={pending}>
          {children}
        </div>
      </div>

      {/* Mobilni panel sa filterima */}
      <div className={cx(styles.mOverlay, mobileOpen && styles.mOverlayOpen)} onClick={() => setMobileOpen(false)} />
      <div className={cx(styles.mPanel, mobileOpen && styles.mPanelOpen)} role="dialog" aria-label="Filteri">
        <div className={styles.mHead}>
          <h2>Filteri</h2>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Zatvori filtere">
            <X size={20} />
          </button>
        </div>
        <div className={styles.mBody}>{panel}</div>
        <div className={styles.mFoot}>
          {active.length > 0 && (
            <button type="button" className="btn btn-outline" onClick={clearAll}>
              Obriši
            </button>
          )}
          <button type="button" className="btn btn-block" onClick={() => setMobileOpen(false)}>
            Prikaži {total} {total === 1 ? 'proizvod' : 'proizvoda'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadMore({ shown, total, nextPage }: { shown: number; total: number; nextPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const loadMore = () => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set('strana', String(nextPage));
    startTransition(() => router.replace(`${pathname}?${qs.toString()}`, { scroll: false }));
  };

  return (
    <div className={styles.loadMore}>
      <p>
        Prikazano {shown} od {total}
      </p>
      <div className={styles.progress}>
        <span style={{ width: `${(shown / total) * 100}%` }} />
      </div>
      <button type="button" className="btn btn-outline" onClick={loadMore} disabled={pending}>
        {pending ? 'Učitavanje…' : 'Prikaži još'}
      </button>
    </div>
  );
}
