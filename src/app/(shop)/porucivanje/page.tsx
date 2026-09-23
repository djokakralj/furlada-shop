import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { getCurrentUser } from '@/lib/session';
import { CheckoutForm, type CheckoutDefaults } from './checkout-form';

export const metadata: Metadata = { title: 'Poručivanje' };

export default async function CheckoutPage() {
  const current = await getCurrentUser();
  let defaults: CheckoutDefaults | null = null;

  if (current) {
    const [u] = await db.select().from(userTable).where(eq(userTable.id, current.id));
    defaults = {
      firstName: u.name,
      lastName: u.lastName ?? '',
      email: u.email,
      phone: u.phone ?? '',
      street: u.street ?? '',
      streetNumber: u.streetNumber ?? '',
      postalCode: u.postalCode ?? '',
      city: u.city ?? '',
    };
  }

  return <CheckoutForm defaults={defaults} loggedIn={!!current} />;
}
