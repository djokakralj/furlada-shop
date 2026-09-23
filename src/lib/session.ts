import 'server-only';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from '@/lib/auth';

// Jedan poziv po requestu, bez obzira koliko komponenti traži sesiju
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser(next = '/nalog') {
  const user = await getCurrentUser();
  if (!user) redirect(`/prijava?next=${encodeURIComponent(next)}`);
  return user;
}

// Poziva se u SVAKOJ admin server akciji — proxy/layout guard štiti samo
// renderovanje stranica, ne i direktne pozive akcija.
// Bez keša kolačića (čita sesiju iz baze) — za proveru admin prava, da bi
// oduzeta prava važila odmah, a ne tek kad keš od 5 min istekne
export const getFreshUser = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  return session?.user ?? null;
});

export async function requireAdmin() {
  const user = await getFreshUser();
  if (!user || user.role !== 'admin') throw new Error('Nemate administratorska prava.');
  return user;
}

// Za admin STRANICE: layout se pri klijentskoj navigaciji ne renderuje uvek
// ponovo, pa svaka stranica koja čita podatke sama proverava prava.
export async function requireAdminPage() {
  const user = await getFreshUser();
  if (!user || user.role !== 'admin') notFound();
  return user;
}
