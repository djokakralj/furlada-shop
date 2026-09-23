// Smanjuje sliku u browseru pre slanja: fotografije sa telefona imaju 3–8 MB,
// a Vercel funkcija prima najviše 4,5 MB po zahtevu. Posle ovoga slika ima
// tipično 200–500 KB; server je zatim još jednom normalizuje (sharp → WebP).
const MAX_SIDE = 2000;

export async function prepareImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== 'function') return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 2 * 1024 * 1024) {
      bitmap.close();
      return file; // već dovoljno mala
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.88));
    // Stariji Safari ne ume da kodira WebP i vrati PNG — tada koristimo JPEG
    const out =
      blob && blob.type === 'image/webp'
        ? blob
        : await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!out) return file;
    const ext = out.type === 'image/webp' ? 'webp' : 'jpg';
    return new File([out], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type: out.type });
  } catch {
    return file; // format koji browser ne ume da dekodira (npr. HEIC) — server će prijaviti grešku
  }
}
