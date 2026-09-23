import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Prijava' };

type Props = { searchParams: Promise<{ next?: string; lozinka?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, lozinka } = await searchParams;
  if (await getCurrentUser()) redirect(next?.startsWith('/') && !next.startsWith('//') ? next : '/nalog');
  return <LoginForm next={next ?? ''} passwordChanged={lozinka === 'promenjena'} />;
}
