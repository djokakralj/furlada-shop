import { and, count, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { getFreshUser } from '@/lib/session';
import { AdminNav } from './admin-nav';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Furlada admin' },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getFreshUser();
  if (!user) redirect('/prijava?next=/admin');

  if (user.role !== 'admin') {
    return (
      <div className={styles.denied}>
        <h1>Pristup odbijen</h1>
        <p>Ova stranica je dostupna samo administratorima.</p>
        <Link href="/" className="btn">
          Nazad na prodavnicu
        </Link>
      </div>
    );
  }

  const [{ value: newOrders }] = await db
    .select({ value: count() })
    .from(orders)
    .where(and(eq(orders.status, 'primljena')));

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" className={styles.brand}>
          FURLADA <span>admin</span>
        </Link>
        <AdminNav newOrders={newOrders} />
        <div className={styles.sidebarFoot}>
          <span className={styles.user}>
            {user.name} {user.lastName}
            <small>{user.email}</small>
          </span>
          <Link href="/" className={styles.backLink}>
            ← Sajt
          </Link>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
