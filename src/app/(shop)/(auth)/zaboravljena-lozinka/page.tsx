'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextField } from '@/components/ui/text-field';
import styles from '../auth.module.css';

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, null);

  return (
    <>
      <title>Zaboravljena lozinka | Furlada</title>
      <h1 className={styles.title}>Zaboravljena lozinka</h1>
      <p className={styles.subtitle}>Unesite email adresu naloga i poslaćemo vam link za postavljanje nove lozinke.</p>

      {state?.success ? (
        <div className="alert alert-success">{state.success}</div>
      ) : (
        <form action={action} className={styles.form} noValidate>
          <TextField label="Email adresa" name="email" type="email" autoComplete="email" error={state?.fieldErrors?.email} />
          <SubmitButton pendingText="Slanje…" className="btn-block">
            Pošalji link
          </SubmitButton>
        </form>
      )}

      <p className={styles.footer}>
        <Link href="/prijava">← Nazad na prijavu</Link>
      </p>
    </>
  );
}
