'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextField } from '@/components/ui/text-field';
import styles from '../auth.module.css';

export function LoginForm({ next, passwordChanged }: { next: string; passwordChanged: boolean }) {
  const [state, action] = useActionState(signIn, null);

  return (
    <>
      <h1 className={styles.title}>Prijava</h1>
      <p className={styles.subtitle}>Dobro došli nazad. Prijavite se da biste pratili porudžbine.</p>

      <form action={action} className={styles.form}>
        {passwordChanged && !state && (
          <div className="alert alert-success">Lozinka je promenjena. Prijavite se novom lozinkom.</div>
        )}
        {state?.error && <div className="alert alert-error">{state.error}</div>}
        <input type="hidden" name="next" value={next} />
        <TextField
          label="Email adresa"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          key={state?.values?.email}
        />
        <TextField label="Lozinka" name="password" type="password" autoComplete="current-password" required />
        <div className={styles.row}>
          <label className={styles.check}>
            <input type="checkbox" name="remember" defaultChecked /> Zapamti me
          </label>
          <Link href="/zaboravljena-lozinka" className="link">
            Zaboravljena lozinka?
          </Link>
        </div>
        <SubmitButton pendingText="Prijava…" className="btn-block">
          Prijavi se
        </SubmitButton>
      </form>

      <p className={styles.footer}>
        Nemate nalog?{' '}
        <Link href={next ? `/registracija?next=${encodeURIComponent(next)}` : '/registracija'}>Registrujte se</Link>
      </p>
    </>
  );
}
