import 'server-only';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Storage za slike proizvoda:
// - na Vercelu (postoji BLOB_READ_WRITE_TOKEN) → Vercel Blob, javni URL sa CDN-a
// - lokalno → folder `uploads/`, servira ga /uploads/[...path]
// Ostatak aplikacije radi samo sa URL-om koji saveImage vrati.
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

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
  // Normalizacija: ispravna orijentacija, max 1600px, WebP — tipično 150–300 KB
  // po slici, a next/image dalje pravi manje verzije po potrebi
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const name = `${randomUUID()}.webp`;

  if (useBlob) {
    const blob = await put(`proizvodi/${dir}/${name}`, output, {
      access: 'public',
      contentType: 'image/webp',
      cacheControlMaxAge: 60 * 60 * 24 * 365, // ime je jedinstveno, sadržaj se ne menja
    });
    return blob.url;
  }

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
