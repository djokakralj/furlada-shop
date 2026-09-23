import { LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { requireUser } from '@/lib/session';
import { cx } from '@/lib/utils';
import { AccountNav } from './account-nav';
import styles from './account.module.css';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className={cx('container', 'page')}>
      <header className={styles.head}>
        <span className="eyebrow">Moj nalog</span>
        <h1 className="page-title">Zdravo, {user.name}</h1>
      </header>
      <div className={styles.layout}>
        <aside className={styles.side}>
          <AccountNav />
          <form action={signOut}>
            <button type="submit" className={styles.logout}>
              <LogOut size={16} /> Odjavi se
            </button>
          </form>
        </aside>
        <section className={styles.content}>{children}</section>
      </div>
    </div>
  );
}
