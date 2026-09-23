import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { RegisterForm } from './register-form';

export const metadata: Metadata = { title: 'Registracija' };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect('/nalog');
  const { next } = await searchParams;
  return <RegisterForm next={next ?? ''} />;
}
