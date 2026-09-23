import type { Metadata } from 'next';
import Form from 'next/form';
import { getAdminUsers } from '@/lib/admin-queries';
import { requireAdminPage } from '@/lib/session';
import { cx, formatDate, formatPrice } from '@/lib/utils';
import ui from '../ui.module.css';
import { RoleToggle } from './role-toggle';

export const metadata: Metadata = { title: 'Korisnici' };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const admin = await requireAdminPage();
  const q = (await searchParams).q?.trim() || undefined;
  const users = await getAdminUsers(q);

  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>Korisnici</h1>
          <p className={ui.subtitle}>Registrovani kupci i administratori. Gosti se vide samo kroz porudžbine.</p>
        </div>
      </div>
      <section className={ui.card}>
        <Form action="/admin/korisnici" className={ui.toolbar}>
          <input name="q" defaultValue={q} className={cx('input', ui.search)} placeholder="Pretraga po imenu ili emailu" type="search" />
        </Form>
        {users.length === 0 ? (
          <p className={ui.empty}>Nema korisnika.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Korisnik</th>
                  <th>Grad</th>
                  <th>Registrovan</th>
                  <th>Porudžbine</th>
                  <th className={ui.num}>Potrošeno</th>
                  <th>Administrator</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className={ui.strong}>
                        {u.name} {u.lastName}
                      </span>
                      <div className={ui.small}>
                        {u.email} {!u.emailVerified && '· email nije potvrđen'}
                      </div>
                    </td>
                    <td className={ui.small}>{u.city ?? '—'}</td>
                    <td className={ui.small}>{formatDate(u.createdAt)}</td>
                    <td>{u.orderCount}</td>
                    <td className={cx(ui.num, ui.strong)}>{formatPrice(u.spent)}</td>
                    <td>
                      <RoleToggle userId={u.id} isAdmin={u.role === 'admin'} self={u.id === admin.id} name={u.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
