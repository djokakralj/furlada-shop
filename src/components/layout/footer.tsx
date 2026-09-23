import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { STORE } from '@/lib/constants';
import { cx } from '@/lib/utils';
import styles from './footer.module.css';

// lucide 1.x više nema brend ikonice
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: 'Kupovina',
    links: [
      { href: '/prodavnica?pol=zene', label: 'Žene' },
      { href: '/prodavnica?pol=muskarci', label: 'Muškarci' },
      { href: '/prodavnica?kategorija=aksesoari', label: 'Aksesoari' },
      { href: '/prodavnica?sort=najnovije', label: 'Novo u ponudi' },
      { href: '/prodavnica?akcija=1', label: 'Akcija' },
    ],
  },
  {
    title: 'Pomoć',
    links: [
      { href: '/dostava', label: 'Dostava i povrat' },
      { href: '/velicine', label: 'Vodič za veličine' },
      { href: '/cesta-pitanja', label: 'Česta pitanja' },
      { href: '/nalog', label: 'Praćenje porudžbine' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={cx('container', styles.main)}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            FURLADA
          </Link>
          <p>Moda koja govori vašim jezikom. Pažljivo birani komadi za svaki dan i posebne prilike.</p>
          <div className={styles.socials}>
            <a href={STORE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={STORE.phoneHref} aria-label="Telefon">
              <Phone size={18} strokeWidth={1.6} />
            </a>
            <a href={`mailto:${STORE.email}`} aria-label="Email">
              <Mail size={18} strokeWidth={1.6} />
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className={styles.col}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={styles.col}>
          <h4>Kontakt</h4>
          <ul>
            <li>
              <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
            </li>
            <li>
              <a href={STORE.phoneHref}>{STORE.phone}</a>
            </li>
            <li>
              <a href={STORE.instagram} target="_blank" rel="noopener noreferrer">
                {STORE.instagramHandle}
              </a>
            </li>
            <li className={styles.hours}>{STORE.hours}</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={cx('container', styles.bottomInner)}>
          <span>© {new Date().getFullYear()} Furlada. Sva prava zadržana.</span>
          <div className={styles.legal}>
            <Link href="/uslovi">Uslovi korišćenja</Link>
            <Link href="/privatnost">Politika privatnosti</Link>
          </div>
          <span className={styles.pay}>Plaćanje pouzećem</span>
        </div>
      </div>
    </footer>
  );
}
