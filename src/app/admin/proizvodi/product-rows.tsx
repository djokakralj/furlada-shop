'use client';

import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';
import { deleteProduct, setProductFlag } from '@/app/actions/admin';
import { useToast } from '@/components/providers/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { COLORS } from '@/lib/constants';
import type { CardProduct } from '@/lib/product';
import { capitalize, cx, formatPrice } from '@/lib/utils';
import ui from '../ui.module.css';

type Row = CardProduct & { active: boolean; featured: boolean };

export function ProductRows({ products }: { products: Row[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [deletePending, startDelete] = useTransition();
  const [rows, applyOptimistic] = useOptimistic(
    products,
    (state, { id, flag, value }: { id: string; flag: 'active' | 'featured'; value: boolean }) =>
      state.map((p) => (p.id === id ? { ...p, [flag]: value } : p)),
  );

  const toggle = (p: Row, flag: 'active' | 'featured') => {
    const value = !p[flag];
    startTransition(async () => {
      applyOptimistic({ id: p.id, flag, value });
      const res = await setProductFlag(p.id, flag, value);
      if (!res.ok) showToast(res.error ?? 'Greška.', 'error');
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleting) return;
    startDelete(async () => {
      const res = await deleteProduct(deleting.id);
      if (res.ok) {
        showToast(`Proizvod „${deleting.name}“ je obrisan.`);
        setDeleting(null);
        router.refresh();
      } else {
        showToast(res.error ?? 'Greška pri brisanju.', 'error');
      }
    });
  };

  return (
    <>
      <div className={ui.tableWrap}>
        <table className={ui.table}>
          <thead>
            <tr>
              <th>Proizvod</th>
              <th>Boja</th>
              <th>Veličine</th>
              <th className={ui.num}>Cena</th>
              <th>Aktivan</th>
              <th>Izdvojen</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} style={p.active ? undefined : { opacity: 0.6 }}>
                <td>
                  <div className={ui.productCell}>
                    <div className={ui.thumb}>{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="44px" />}</div>
                    <div>
                      <Link href={`/admin/proizvodi/${p.id}`} className={ui.rowLink}>
                        {p.name}
                      </Link>
                      <div className={ui.small}>{p.subcategory}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span className="color-dot" style={{ background: COLORS[p.color] ?? '#ccc' }} />
                    {capitalize(p.color)}
                  </span>
                </td>
                <td className={ui.small}>{p.sizes.length ? p.sizes.join(', ') : '—'}</td>
                <td className={cx(ui.num, ui.strong)}>
                  {formatPrice(p.price)}
                  {p.compareAtPrice && (
                    <div className={ui.small}>
                      <s>{formatPrice(p.compareAtPrice)}</s>
                    </div>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={cx(ui.switch, p.active && ui.switchOn)}
                    onClick={() => toggle(p, 'active')}
                    aria-pressed={p.active}
                    aria-label={p.active ? 'Sakrij sa sajta' : 'Prikaži na sajtu'}
                    title={p.active ? 'Vidljiv na sajtu' : 'Sakriven sa sajta'}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className={cx(ui.switch, p.featured && ui.switchOn)}
                    onClick={() => toggle(p, 'featured')}
                    aria-pressed={p.featured}
                    aria-label={p.featured ? 'Ukloni sa početne' : 'Izdvoji na početnoj'}
                    title={p.featured ? 'Izdvojen na početnoj' : 'Nije izdvojen'}
                  />
                </td>
                <td>
                  <div className={ui.actions}>
                    {p.active && (
                      <Link href={`/proizvod/${p.slug}`} target="_blank" className={ui.iconBtn} aria-label="Otvori na sajtu">
                        <ExternalLink size={15} />
                      </Link>
                    )}
                    <Link href={`/admin/proizvodi/${p.id}`} className={ui.iconBtn} aria-label={`Izmeni ${p.name}`}>
                      <Pencil size={15} />
                    </Link>
                    <button
                      type="button"
                      className={cx(ui.iconBtn, ui.iconBtnDanger)}
                      onClick={() => setDeleting(p)}
                      aria-label={`Obriši ${p.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Obrisati proizvod?"
        message={
          <>
            Proizvod <strong>{deleting?.name}</strong> biće trajno obrisan. Postojeće porudžbine ostaju netaknute. Ako
            proizvod samo privremeno ne prodajete, bolje ga sakrijte prekidačem „Aktivan“.
          </>
        }
        pending={deletePending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
