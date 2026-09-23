import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// Lokalno se čita .env; na Vercelu promenljive već postoje u okruženju
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // Migracije idu direktno na bazu (bez poolera) kad je ta adresa dostupna — Neon je daje kao DATABASE_URL_UNPOOLED
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
