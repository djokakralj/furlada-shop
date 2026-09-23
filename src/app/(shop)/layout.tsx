import { CartDrawer } from '@/components/cart/cart-drawer';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import styles from './layout.module.css';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
