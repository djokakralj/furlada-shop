import { z } from 'zod';

const req = (label: string, max = 100) =>
  z.string().trim().min(1, `${label} je obavezno polje.`).max(max, `${label} je predugačko.`);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()/-]{6,20}$/, 'Unesite ispravan broj telefona.');

export const postalSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{5}$/, 'Poštanski broj ima 5 cifara.');

export const emailSchema = z.string().trim().toLowerCase().email('Unesite ispravnu email adresu.');

export const addressSchema = z.object({
  street: req('Ulica'),
  streetNumber: req('Broj', 20),
  postalCode: postalSchema,
  city: req('Grad', 60),
});

export const checkoutSchema = z
  .object({
    firstName: req('Ime', 60),
    lastName: req('Prezime', 60),
    email: emailSchema,
    phone: phoneSchema,
    delivery: z.enum(['kurir', 'preuzimanje']),
    street: z.string().trim().optional(),
    streetNumber: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    city: z.string().trim().optional(),
    note: z.string().trim().max(500, 'Napomena može imati najviše 500 karaktera.').optional(),
    saveAddress: z.boolean().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          size: z.string().nullable(),
          quantity: z.number().int().min(1).max(10),
        }),
      )
      .min(1, 'Korpa je prazna.')
      .max(50),
  })
  .superRefine((data, ctx) => {
    // Adresa je obavezna samo za kurirsku dostavu
    if (data.delivery !== 'kurir') return;
    const res = addressSchema.safeParse(data);
    if (!res.success) {
      for (const issue of res.error.issues) ctx.addIssue({ ...issue });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const profileSchema = z.object({
  name: req('Ime', 60),
  lastName: req('Prezime', 60),
  phone: phoneSchema.or(z.literal('')),
  street: z.string().trim().max(100),
  streetNumber: z.string().trim().max(20),
  postalCode: postalSchema.or(z.literal('')),
  city: z.string().trim().max(60),
});

export const passwordSchema = z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera.').max(128);

export const registerSchema = z
  .object({
    name: req('Ime', 60),
    lastName: req('Prezime', 60),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Lozinke se ne poklapaju.' });

// Pretvara zod greške u { polje: poruka } za prikaz ispod inputa
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };
