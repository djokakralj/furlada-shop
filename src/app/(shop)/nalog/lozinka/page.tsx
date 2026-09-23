'use client';

import { useActionState } from 'react';
import { changePassword } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextField } from '@/components/ui/text-field';
import styles from '../account.module.css';

export default function PasswordPage() {
  const [state, action] = useActionState(changePassword, null);
  const err = state?.fieldErrors ?? {};

  return (
    <form action={action} className={styles.form} style={{ maxWidth: 440 }} noValidate key={state?.success}>
      <title>Promena lozinke | Furlada</title>
      <h2 className={styles.sectionTitle}>Promena lozinke</h2>
      {state?.success && <div className="alert alert-success">{state.success}</div>}
      {state?.error && <div className="alert alert-error">{state.error}</div>}
      <TextField label="Trenutna lozinka" name="current" type="password" autoComplete="current-password" error={err.current} />
      <TextField
        label="Nova lozinka"
        name="password"
        type="password"
        autoComplete="new-password"
        error={err.password}
        hint="Najmanje 8 karaktera."
      />
      <TextField label="Ponovite novu lozinku" name="confirm" type="password" autoComplete="new-password" error={err.confirm} />
      <div>
        <SubmitButton>Promeni lozinku</SubmitButton>
      </div>
    </form>
  );
}
