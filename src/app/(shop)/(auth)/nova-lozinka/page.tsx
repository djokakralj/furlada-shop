import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetForm } from './reset-form';
import styles from '../auth.module.css';

export const metadata: Metadata = { title: 'Nova lozinka' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token || error) {
    return (
      <>
        <h1 className={styles.title}>Link nije važeći</h1>
        <p className={styles.subtitle}>Link za promenu lozinke je istekao ili je već iskorišćen.</p>
        <Link href="/zaboravljena-lozinka" className="btn btn-block">
          Zatražite novi link
        </Link>
      </>
    );
  }

  return <ResetForm token={token} />;
}
