'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signUp } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextField } from '@/components/ui/text-field';
import styles from '../auth.module.css';

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, null);
  const err = state?.fieldErrors ?? {};
  const v = state?.values ?? {};

  return (
    <>
      <h1 className={styles.title}>Registracija</h1>
      <p className={styles.subtitle}>
        Sa nalogom brže poručujete, pratite status porudžbina i čuvate adresu za dostavu.
      </p>

      <form action={action} className={styles.form} noValidate>
        {state?.error && <div className="alert alert-error">{state.error}</div>}
        <input type="hidden" name="next" value={next} />
        <div className="form-grid">
          <TextField label="Ime" name="name" autoComplete="given-name" defaultValue={v.name} error={err.name} key={`n${v.name}`} />
          <TextField
            label="Prezime"
            name="lastName"
            autoComplete="family-name"
            defaultValue={v.lastName}
            error={err.lastName}
            key={`l${v.lastName}`}
          />
        </div>
        <TextField
          label="Email adresa"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={v.email}
          error={err.email}
          key={`e${v.email}`}
        />
        <TextField
          label="Lozinka"
          name="password"
          type="password"
          autoComplete="new-password"
          error={err.password}
          hint="Najmanje 8 karaktera."
        />
        <TextField label="Ponovite lozinku" name="confirm" type="password" autoComplete="new-password" error={err.confirm} />
        <SubmitButton pendingText="Kreiranje naloga…" className="btn-block">
          Kreiraj nalog
        </SubmitButton>
      </form>

      <p className={styles.footer}>
        Već imate nalog? <Link href={next ? `/prijava?next=${encodeURIComponent(next)}` : '/prijava'}>Prijavite se</Link>
      </p>
    </>
  );
}
