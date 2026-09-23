'use server';

import { and, count, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/db';
import { orders, products, subcategories, user, type OrderStatus } from '@/db/schema';
import { ORDER_STATUSES } from '@/lib/constants';
import { requireAdmin } from '@/lib/session';
import { saveImage } from '@/lib/storage';
import { slugify } from '@/lib/utils';
import { fieldErrors, type ActionResult } from '@/lib/validation';

// Svaka akcija u ovom fajlu počinje sa requireAdmin() — server akcije su
// javni HTTP endpointi i ne smeju se oslanjati na to što je stranica zaštićena.

// ─── Porudžbine ─────────────────────────────────────────────────────────────

// Argumenti server akcija stižu sa klijenta — TypeScript tipovi ne važe u
// runtime-u, pa se sve proverava
const uuid = z.string().uuid();

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(orderId).success) return { ok: false, error: 'Neispravna porudžbina.' };
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: 'Nepoznat status.' };
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
  revalidatePath('/admin', 'layout');
  return { ok: true };
}

// ─── Proizvodi ──────────────────────────────────────────────────────────────

const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Naziv je obavezan.').max(120),
    description: z.string().trim().min(10, 'Opis treba da ima bar 10 karaktera.').max(3000),
    details: z.string().trim().max(2000).optional(),
    brand: z.string().trim().max(60).optional(),
    price: z.coerce.number().int('Cena mora biti ceo broj.').min(1, 'Unesite cenu.').max(10_000_000),
    compareAtPrice: z.coerce.number().int().min(0).max(10_000_000).optional(),
    subcategoryId: z.coerce.number().int().min(1, 'Izaberite vrstu proizvoda.'),
    gender: z.enum(['zene', 'muskarci', 'unisex']),
    color: z.string().trim().min(1, 'Izaberite boju.'),
    sizes: z.array(z.string()).max(30),
    // samo izvori koje next/image sme da učita (inače bi se stranica proizvoda srušila)
    images: z
      .array(
        z
          .string()
          .trim()
          .regex(
            /^(https:\/\/images\.unsplash\.com\/|https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/|\/uploads\/)/,
            'Nepodržan izvor slike.',
          ),
      )
      .max(10),
    featured: z.boolean(),
    active: z.boolean(),
  })
  .refine((d) => !d.compareAtPrice || d.compareAtPrice > d.price, {
    path: ['compareAtPrice'],
    message: 'Stara cena mora biti veća od nove (inače ostavite prazno).',
  });

export type ProductInput = z.input<typeof productSchema>;

async function uniqueSlug(name: string, excludeId?: string) {
  const base = slugify(name) || 'proizvod';
  let slug = base;
  for (let i = 2; ; i++) {
    const [taken] = await db
      .select({ id: products.id })
      .from(products)
      .where(excludeId ? and(eq(products.slug, slug), ne(products.id, excludeId)) : eq(products.slug, slug));
    if (!taken) return slug;
    slug = `${base}-${i}`;
  }
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  if (id !== null && !uuid.safeParse(id).success) return { ok: false, error: 'Neispravan zahtev.' };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Proverite označena polja.', fieldErrors: fieldErrors(parsed.error) };
  const d = parsed.data;

  const [sub] = await db.select().from(subcategories).where(eq(subcategories.id, d.subcategoryId));
  if (!sub) return { ok: false, fieldErrors: { subcategoryId: 'Nepoznata vrsta proizvoda.' } };
  // Veličine moraju biti iz skupa definisanog za vrstu
  const sizes = sub.sizes.filter((s) => d.sizes.includes(s));
  if (sub.sizes.length > 0 && sizes.length === 0) {
    return { ok: false, fieldErrors: { sizes: 'Izaberite bar jednu veličinu.' } };
  }

  const values = {
    name: d.name,
    description: d.description,
    details: d.details || null,
    brand: d.brand || null,
    price: d.price,
    compareAtPrice: d.compareAtPrice || null,
    subcategoryId: d.subcategoryId,
    gender: d.gender,
    color: d.color,
    sizes,
    images: d.images,
    featured: d.featured,
    active: d.active,
  };

  let savedId = id;
  if (id) {
    const [existing] = await db.select({ name: products.name }).from(products).where(eq(products.id, id));
    if (!existing) return { ok: false, error: 'Proizvod ne postoji.' };
    const slug = existing.name === d.name ? undefined : await uniqueSlug(d.name, id);
    await db.update(products).set({ ...values, ...(slug ? { slug } : {}) }).where(eq(products.id, id));
  } else {
    const [row] = await db
      .insert(products)
      .values({ ...values, slug: await uniqueSlug(d.name) })
      .returning({ id: products.id });
    savedId = row.id;
  }

  revalidatePath('/', 'layout');
  return { ok: true, data: { id: savedId! } };
}

export async function setProductFlag(id: string, flag: 'active' | 'featured', value: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success || (flag !== 'active' && flag !== 'featured') || typeof value !== 'boolean') {
    return { ok: false, error: 'Neispravan zahtev.' };
  }
  await db.update(products).set(flag === 'active' ? { active: value } : { featured: value }).where(eq(products.id, id));
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, error: 'Neispravan zahtev.' };
  // Stavke porudžbina čuvaju snimak naziva/cene, pa brisanje ne kvari istoriju
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function uploadImages(formData: FormData): Promise<ActionResult<{ urls: string[] }>> {
  await requireAdmin();
  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { ok: false, error: 'Nije izabrana nijedna slika.' };
  if (files.length > 10) return { ok: false, error: 'Najviše 10 slika odjednom.' };
  try {
    const urls = [];
    for (const file of files) urls.push(await saveImage(file));
    return { ok: true, data: { urls } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Greška pri otpremanju slike.' };
  }
}

// ─── Vrste proizvoda ────────────────────────────────────────────────────────

const subcategorySchema = z.object({
  name: z.string().trim().min(2, 'Naziv je obavezan.').max(60),
  category: z.enum(['odeca', 'aksesoari']),
  sizes: z.array(z.string().trim().toUpperCase().min(1).max(10)).max(30),
  colors: z.array(z.string()).min(1, 'Izaberite bar jednu boju.'),
  position: z.coerce.number().int().min(0).max(999),
});

export type SubcategoryInput = z.input<typeof subcategorySchema>;

export async function saveSubcategory(id: number | null, input: SubcategoryInput): Promise<ActionResult<{ id: number }>> {
  await requireAdmin();
  if (id !== null && !Number.isInteger(id)) return { ok: false, error: 'Neispravan zahtev.' };
  const parsed = subcategorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Proverite označena polja.', fieldErrors: fieldErrors(parsed.error) };
  const d = { ...parsed.data, sizes: [...new Set(parsed.data.sizes)] };
  const slug = slugify(d.name);

  const [clash] = await db.select({ id: subcategories.id }).from(subcategories).where(eq(subcategories.slug, slug));
  if (clash && clash.id !== id) return { ok: false, fieldErrors: { name: 'Vrsta sa ovim nazivom već postoji.' } };

  let savedId = id;
  if (id) {
    await db.update(subcategories).set({ ...d, slug }).where(eq(subcategories.id, id));
  } else {
    const [row] = await db.insert(subcategories).values({ ...d, slug }).returning({ id: subcategories.id });
    savedId = row.id;
  }
  revalidatePath('/', 'layout');
  return { ok: true, data: { id: savedId! } };
}

export async function deleteSubcategory(id: number): Promise<ActionResult> {
  await requireAdmin();
  if (!Number.isInteger(id)) return { ok: false, error: 'Neispravan zahtev.' };
  const [{ value }] = await db.select({ value: count() }).from(products).where(eq(products.subcategoryId, id));
  if (value > 0) {
    return { ok: false, error: `Vrsta ima ${value} proizvoda — prvo ih premestite ili obrišite.` };
  }
  await db.delete(subcategories).where(eq(subcategories.id, id));
  revalidatePath('/', 'layout');
  return { ok: true };
}

// ─── Korisnici ──────────────────────────────────────────────────────────────

export async function setUserRole(userId: string, role: 'user' | 'admin'): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (typeof userId !== 'string' || (role !== 'user' && role !== 'admin')) return { ok: false, error: 'Neispravan zahtev.' };
  if (userId === admin.id) return { ok: false, error: 'Ne možete promeniti sopstvenu ulogu.' };
  await db.update(user).set({ role }).where(eq(user.id, userId));
  revalidatePath('/admin/korisnici');
  return { ok: true };
}
