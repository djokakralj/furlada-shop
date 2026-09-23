'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/app/actions/auth';
import { SubmitButton } from '@/components/ui/submit-button';
import { TextField } from '@/components/ui/text-field';
import styles from '../account.module.css';

type Values = Record<'name' | 'lastName' | 'phone' | 'street' | 'streetNumber' | 'postalCode' | 'city', string>;

export function ProfileForm({ email, emailVerified, initial }: { email: string; emailVerified: boolean; initial: Values }) {
  const [state, action] = useActionState(updateProfile, null);
  const v = (state?.values as Values | undefined) ?? initial;
  const err = state?.fieldErrors ?? {};
  const f = (name: keyof Values, label: string, extra: Partial<React.ComponentProps<typeof TextField>> = {}) => (
    <TextField label={label} name={name} defaultValue={v[name]} error={err[name]} {...extra} />
  );

  return (
    <form action={action} className={styles.form} noValidate>
      <h2 className={styles.sectionTitle}>Lični podaci</h2>
      {state?.success && <div className="alert alert-success">{state.success}</div>}
      {state?.error && <div className="alert alert-error">{state.error}</div>}

      <div className="form-grid">
        {f('name', 'Ime', { autoComplete: 'given-name' })}
        {f('lastName', 'Prezime', { autoComplete: 'family-name' })}
        <div className="field">
          <span className="label">Email</span>
          <div className={styles.readonly}>
            {email}
            <span className={emailVerified ? 'badge status-isporucena' : 'badge status-primljena'}>
              {emailVerified ? 'Potvrđen' : 'Nije potvrđen'}
            </span>
          </div>
        </div>
        {f('phone', 'Telefon', { type: 'tel', autoComplete: 'tel', optional: true })}
      </div>

      <h3 className={styles.subTitle}>Adresa za dostavu</h3>
      <p className="muted" style={{ fontSize: '0.84rem', marginTop: -8 }}>
        Automatski se popunjava pri poručivanju.
      </p>
      <div className="form-grid">
        {f('street', 'Ulica', { autoComplete: 'address-line1', optional: true })}
        {f('streetNumber', 'Broj', { optional: true })}
        {f('postalCode', 'Poštanski broj', { inputMode: 'numeric', maxLength: 5, optional: true })}
        {f('city', 'Grad', { autoComplete: 'address-level2', optional: true })}
      </div>

      <div>
        <SubmitButton>Sačuvaj izmene</SubmitButton>
      </div>
    </form>
  );
}
