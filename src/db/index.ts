import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL nije podešen (.env)');

// U dev modu Next ponovo učitava module pri svakoj izmeni — čuvamo jednu
// konekciju na globalThis da ne bismo otvarali novi pool za svaki reload.
const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };
// prepare: false — Neon (i drugi hostovani Postgres-i) koriste PgBouncer pooler
// u transaction modu, koji ne podržava prepared statements
const client = globalForDb.pgClient ?? postgres(url, { max: 10, prepare: false });
if (process.env.NODE_ENV !== 'production') globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export type DB = typeof db;
