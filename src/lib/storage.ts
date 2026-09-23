import 'server-only';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Lokalni storage za slike proizvoda. Fajlovi se čuvaju u UPLOAD_DIR i
// serviraju preko /uploads/[...path]. Za hosting na serverless platformi
// (Vercel i sl.) ovo treba zameniti S3/R2/Blob storage-om — dovoljno je
// promeniti saveImage/readImage, ostatak aplikacije radi samo sa URL-om.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR)
  : path.join(process.cwd(), 'uploads');
const PUBLIC_PREFIX = '/uploads/';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export async function saveImage(file: File) {
  if (!ALLOWED.has(file.type)) throw new Error(`Nepodržan format: ${file.name}`);
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`Slika ${file.name} je veća od 8 MB.`);

  const input = Buffer.from(await file.arrayBuffer());
  // Normalizacija: ispravna orijentacija, max 1600px, WebP — manji fajlovi,
  // a next/image dalje pravi potrebne veličine
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const name = `${randomUUID()}.webp`;
  await mkdir(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, dir), { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, dir, name), output);
  return `${PUBLIC_PREFIX}${dir}/${name}`;
}

export async function readImage(segments: string[]) {
  const target = path.resolve(/* turbopackIgnore: true */ UPLOAD_DIR, ...segments);
  // zaštita od ../ izlaska iz direktorijuma
  if (!target.startsWith(UPLOAD_DIR + path.sep)) return null;
  try {
    return await readFile(target);
  } catch {
    return null;
  }
}
