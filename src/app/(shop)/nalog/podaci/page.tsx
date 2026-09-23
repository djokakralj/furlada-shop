import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '@/db';
import { user as userTable } from '@/db/schema';
import { requireUser } from '@/lib/session';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Lični podaci' };

export default async function ProfilePage() {
  const current = await requireUser('/nalog/podaci');
  const [u] = await db.select().from(userTable).where(eq(userTable.id, current.id));

  return (
    <ProfileForm
      email={u.email}
      emailVerified={u.emailVerified}
      initial={{
        name: u.name,
        lastName: u.lastName ?? '',
        phone: u.phone ?? '',
        street: u.street ?? '',
        streetNumber: u.streetNumber ?? '',
        postalCode: u.postalCode ?? '',
        city: u.city ?? '',
      }}
    />
  );
}
