'use client';

import { useActionState } from 'react';
import { resetPassword } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextField } from '@/components/ui/text-field';
import styles from '../auth.module.css';

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, null);
  return (
    <>
      <h1 className={styles.title}>Nova lozinka</h1>
      <p className={styles.subtitle}>Izaberite novu lozinku za svoj nalog.</p>
      <form action={action} className={styles.form} noValidate>
        {state?.error && <div className="alert alert-error">{state.error}</div>}
        <input type="hidden" name="token" value={token} />
        <TextField
          label="Nova lozinka"
          name="password"
          type="password"
          autoComplete="new-password"
          error={state?.fieldErrors?.password}
          hint="Najmanje 8 karaktera."
        />
        <TextField
          label="Ponovite lozinku"
          name="confirm"
          type="password"
          autoComplete="new-password"
          error={state?.fieldErrors?.confirm}
        />
        <SubmitButton pendingText="Čuvanje…" className="btn-block">
          Sačuvaj lozinku
        </SubmitButton>
      </form>
    </>
  );
}
