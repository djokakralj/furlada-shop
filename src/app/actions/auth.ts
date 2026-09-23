'use server';

import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/db';
import { user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { requireUser } from '@/lib/session';
import { emailSchema, fieldErrors, passwordSchema, profileSchema, registerSchema } from '@/lib/validation';

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
} | null;

// Dozvoljeni su samo relativni putevi unutar sajta (zaštita od open-redirect)
function safeNext(value: FormDataEntryValue | null, fallback: string) {
  const v = typeof value === 'string' ? value : '';
  return v.startsWith('/') && !v.startsWith('//') ? v : fallback;
}

const errorCode = (err: unknown) => (err instanceof APIError ? (err.body?.code as string | undefined) : undefined);

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Unesite email adresu i lozinku.', values: { email } };

  try {
    await auth.api.signInEmail({
      body: { email, password, rememberMe: formData.get('remember') === 'on' },
      headers: await headers(),
    });
  } catch (err) {
    if (errorCode(err) === 'INVALID_EMAIL_OR_PASSWORD') {
      return { error: 'Pogrešna email adresa ili lozinka.', values: { email } };
    }
    console.error('signIn', err);
    return { error: 'Prijava trenutno nije moguća. Pokušajte ponovo.', values: { email } };
  }
  redirect(safeNext(formData.get('next'), '/nalog'));
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(['name', 'lastName', 'email', 'password', 'confirm'].map((k) => [k, String(formData.get(k) ?? '')]));
  const values = { name: raw.name, lastName: raw.lastName, email: raw.email };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
  } catch (err) {
    const code = errorCode(err);
    if (code?.startsWith('USER_ALREADY_EXISTS')) {
      return { fieldErrors: { email: 'Nalog sa ovom email adresom već postoji.' }, values };
    }
    console.error('signUp', err);
    return { error: 'Registracija trenutno nije moguća. Pokušajte ponovo.', values };
  }
  redirect(safeNext(formData.get('next'), '/nalog?dobrodosli=1'));
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect('/');
}

export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = emailSchema.safeParse(formData.get('email'));
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0].message } };
  try {
    await auth.api.requestPasswordReset({ body: { email: parsed.data, redirectTo: '/nova-lozinka' } });
  } catch (err) {
    console.error('requestPasswordReset', err);
  }
  // Isti odgovor bez obzira da li nalog postoji — ne otkrivamo ko je registrovan
  return { success: 'Ako nalog sa ovom adresom postoji, poslali smo link za postavljanje nove lozinke.' };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get('token') ?? '');
  const parsed = z
    .object({ password: passwordSchema, confirm: z.string() })
    .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Lozinke se ne poklapaju.' })
    .safeParse({ password: formData.get('password'), confirm: formData.get('confirm') });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await auth.api.resetPassword({ body: { newPassword: parsed.data.password, token } });
  } catch (err) {
    if (errorCode(err) === 'INVALID_TOKEN') {
      return { error: 'Link je istekao ili je već iskorišćen. Zatražite novi.' };
    }
    console.error('resetPassword', err);
    return { error: 'Promena lozinke trenutno nije moguća.' };
  }
  redirect('/prijava?lozinka=promenjena');
}

// ─── Nalog ──────────────────────────────────────────────────────────────────

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await requireUser();
  const raw = Object.fromEntries(
    ['name', 'lastName', 'phone', 'street', 'streetNumber', 'postalCode', 'city'].map((k) => [k, String(formData.get(k) ?? '')]),
  );
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values: raw };

  const d = parsed.data;
  await db
    .update(user)
    .set({
      name: d.name,
      lastName: d.lastName,
      phone: d.phone || null,
      street: d.street || null,
      streetNumber: d.streetNumber || null,
      postalCode: d.postalCode || null,
      city: d.city || null,
    })
    .where(eq(user.id, current.id));
  return { success: 'Podaci su sačuvani.', values: raw };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const parsed = z
    .object({ current: z.string().min(1, 'Unesite trenutnu lozinku.'), password: passwordSchema, confirm: z.string() })
    .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Lozinke se ne poklapaju.' })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await auth.api.changePassword({
      body: { currentPassword: parsed.data.current, newPassword: parsed.data.password, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (err) {
    if (errorCode(err) === 'INVALID_PASSWORD') return { fieldErrors: { current: 'Trenutna lozinka nije ispravna.' } };
    console.error('changePassword', err);
    return { error: 'Promena lozinke trenutno nije moguća.' };
  }
  return { success: 'Lozinka je promenjena. Ostali uređaji su odjavljeni.' };
}
