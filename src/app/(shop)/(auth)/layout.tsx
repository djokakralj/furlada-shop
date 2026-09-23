import Image from 'next/image';
import styles from './auth.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.visual}>
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&h=1800&q=80"
          alt=""
          fill
          sizes="50vw"
          loading="eager"
        />
        <div className={styles.quote}>
          <span>FURLADA</span>
          <p>Moda koja govori vašim jezikom.</p>
        </div>
      </div>
      <div className={styles.panel}>
        <div className={styles.inner}>{children}</div>
      </div>
    </div>
  );
}
