import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from '@/components/order/order-status';
import { getDashboardData } from '@/lib/admin-queries';
import { requireAdminPage } from '@/lib/session';
import { cx, formatDate, formatPrice, orderNumber } from '@/lib/utils';
import styles from './dashboard.module.css';
import ui from './ui.module.css';

export const metadata: Metadata = { title: 'Pregled' };

export default async function AdminDashboard() {
  await requireAdminPage();
  const d = await getDashboardData();
  const max = Math.max(...d.days.map((x) => x.total), 1);

  const stats = [
    { label: 'Promet (30 dana)', value: formatPrice(d.revenue30), href: '/admin/porudzbine' },
    { label: 'Porudžbine (30 dana)', value: d.orders30, href: '/admin/porudzbine' },
    {
      label: 'Nove porudžbine',
      value: d.newOrders,
      href: '/admin/porudzbine?status=primljena',
      highlight: d.newOrders > 0,
    },
    { label: 'Aktivni proizvodi', value: d.activeProducts, href: '/admin/proizvodi?status=aktivni' },
    { label: 'Registrovani korisnici', value: d.customers, href: '/admin/korisnici' },
  ];

  return (
    <>
      <div className={ui.pageHead}>
        <div>
          <h1 className={ui.title}>Pregled</h1>
          <p className={ui.subtitle}>Stanje prodavnice u poslednjih 30 dana. Otkazane porudžbine nisu uračunate.</p>
        </div>
      </div>

      <div className={styles.stats}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={cx(styles.stat, s.highlight && styles.statHighlight)}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </Link>
        ))}
      </div>

      <div className={styles.grid}>
        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Promet po danima</h2>
            <span className={ui.small}>poslednjih 14 dana</span>
          </div>
          <div className={styles.chart}>
            {d.days.map((day) => (
              <div
                key={day.day}
                className={styles.bar}
                title={`${formatDate(day.date)}: ${formatPrice(day.total)} (${day.count} porudžbina)`}
              >
                <span className={styles.barFill} style={{ height: `${(day.total / max) * 100}%` }} />
                <span className={styles.barLabel}>{day.date.getDate()}.</span>
              </div>
            ))}
          </div>
        </section>

        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2>Najprodavanije</h2>
            <span className={ui.small}>30 dana</span>
          </div>
          {d.top.length === 0 ? (
            <p className={ui.empty}>Još nema prodaje.</p>
          ) : (
            <ul className={styles.top}>
              {d.top.map((t, i) => (
                <li key={`${t.productId}-${i}`}>
                  <div className={ui.thumb}>{t.image && <Image src={t.image} alt="" fill sizes="44px" />}</div>
                  <div className={styles.topText}>
                    {t.productId ? (
                      <Link href={`/admin/proizvodi/${t.productId}`} className={ui.rowLink}>
                        {t.name}
                      </Link>
                    ) : (
                      <span>{t.name}</span>
                    )}
                    <span className={ui.small}>{t.quantity} kom.</span>
                  </div>
                  <span className={ui.strong}>{formatPrice(t.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={ui.card} style={{ marginTop: 20 }}>
        <div className={ui.cardHead}>
          <h2>Poslednje porudžbine</h2>
          <Link href="/admin/porudzbine" className={ui.cardLink}>
            Sve porudžbine <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
        {d.recent.length === 0 ? (
          <p className={ui.empty}>Još uvek nema porudžbina.</p>
        ) : (
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Broj</th>
                  <th>Kupac</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th className={ui.num}>Iznos</th>
                </tr>
              </thead>
              <tbody>
                {d.recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/porudzbine/${o.id}`} className={ui.rowLink}>
                        {orderNumber(o.number)}
                      </Link>
                    </td>
                    <td>
                      {o.firstName} {o.lastName}
                      <div className={ui.small}>{o.userId ? 'registrovan' : 'gost'}</div>
                    </td>
                    <td className={ui.small}>{formatDate(o.createdAt, true)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={cx(ui.num, ui.strong)}>{formatPrice(o.total)}</td>
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
