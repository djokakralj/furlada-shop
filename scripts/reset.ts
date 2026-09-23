// Briše SVE tabele u bazi (šemu public i evidenciju migracija).
// Koristi se samo lokalno: npm run db:reset (reset + migracije + seed)
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL nije podešen');

const host = new URL(url).hostname;
if (!['localhost', '127.0.0.1'].includes(host)) {
  console.error(`Odbijeno: reset je dozvoljen samo za lokalnu bazu (host: ${host}).`);
  process.exit(1);
}

async function main() {
  const sql = postgres(url!, { onnotice: () => {} });
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
  await sql`CREATE SCHEMA public`;
  await sql.end();
  console.log('Baza je obrisana.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
