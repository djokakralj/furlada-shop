import 'server-only';
import { sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/db';
import { actionLimits } from '@/db/schema';

// IP klijenta. Na Vercelu x-forwarded-for postavlja platforma (klijent ga ne
// može podmetnuti); lokalno je uvek isti.
export async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] ?? h.get('x-real-ip') ?? 'local').trim();
}

// Atomski brojač u bazi: vraća true ako je zahtev dozvoljen.
// Prozor je fiksan (npr. 5 pokušaja u 15 min), resetuje se kad istekne.
export async function allow(key: string, max: number, windowSeconds: number) {
  const [row] = await db
    .insert(actionLimits)
    .values({ key, count: 1, resetAt: sql`now() + make_interval(secs => ${windowSeconds})` })
    .onConflictDoUpdate({
      target: actionLimits.key,
      set: {
        count: sql`case when ${actionLimits.resetAt} < now() then 1 else ${actionLimits.count} + 1 end`,
        resetAt: sql`case when ${actionLimits.resetAt} < now() then excluded.reset_at else ${actionLimits.resetAt} end`,
      },
    })
    .returning({ count: actionLimits.count });
  return row.count <= max;
}

export const TOO_MANY = 'Previše pokušaja. Sačekajte nekoliko minuta pa pokušajte ponovo.';
