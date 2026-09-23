// Popunjava praznu bazu test podacima: vrste proizvoda, proizvodi, admin,
// test korisnici i nekoliko porudžbina. Pokretanje: npm run db:seed
// (za ponovno punjenje od nule: npm run db:reset)
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders, products, subcategories, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { DELIVERY_COST } from '@/lib/constants';
import { slugify } from '@/lib/utils';
import { PRODUCTS, SUBCATEGORIES, TEST_USER_PASSWORD, USERS } from './seed-data';

async function createUser(data: {
  email: string;
  password: string;
  name: string;
  lastName?: string;
}) {
  const res = await auth.api.signUpEmail({
    body: { email: data.email, password: data.password, name: data.name, lastName: data.lastName },
  });
  // Seed nalozi ne treba da čekaju potvrdu emaila
  await db.update(user).set({ emailVerified: true }).where(eq(user.id, res.user.id));
  return res.user.id;
}

async function main() {
  process.env.SUPPRESS_EMAIL = '1';
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(user);
  if (count > 0) {
    console.error('Baza nije prazna — za ponovno punjenje pokrenite: npm run db:reset');
    process.exit(1);
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL i SEED_ADMIN_PASSWORD moraju biti podešeni u .env');
  }

  // Na udaljenoj (produkcijskoj) bazi: bez test kupaca i lažnih porudžbina,
  // i admin lozinka mora biti jaka
  const host = new URL(process.env.DATABASE_URL!).hostname;
  const isLocal = ['localhost', '127.0.0.1'].includes(host);
  if (!isLocal && adminPassword.length < 14) {
    throw new Error('Za udaljenu bazu SEED_ADMIN_PASSWORD mora imati bar 14 karaktera.');
  }

  console.log('── Vrste proizvoda');
  const subRows = await db
    .insert(subcategories)
    .values(
      SUBCATEGORIES.map((s, i) => ({
        slug: slugify(s.name),
        name: s.name,
        category: s.category,
        sizes: s.sizes,
        colors: s.colors,
        position: i,
      })),
    )
    .returning();
  const subByName = new Map(subRows.map((s) => [s.name, s]));
  console.log(`   ${subRows.length} vrsta`);

  console.log('── Proizvodi');
  const now = Date.now();
  const productRows = await db
    .insert(products)
    .values(
      PRODUCTS.map((p, i) => {
        const sub = subByName.get(p.subcategory);
        if (!sub) throw new Error(`Nepoznata vrsta: ${p.subcategory}`);
        return {
          slug: slugify(p.name),
          name: p.name,
          description: p.description,
          details: p.details ?? null,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? null,
          subcategoryId: sub.id,
          gender: p.gender,
          color: p.color,
          sizes: p.sizes ?? sub.sizes,
          images: p.images,
          featured: p.featured ?? false,
          // Raspoređeni datumi da "Najnovije" sortiranje ima smisla
          createdAt: new Date(now - i * 36 * 60 * 60 * 1000),
        };
      }),
    )
    .returning();
  console.log(`   ${productRows.length} proizvoda`);

  console.log('── Korisnici');
  const adminId = await createUser({
    email: adminEmail,
    password: adminPassword,
    name: 'Stokić',
    lastName: 'Admin',
  });
  await db.update(user).set({ role: 'admin' }).where(eq(user.id, adminId));
  console.log(`   admin: ${adminEmail}`);

  if (!isLocal) {
    console.log('\nUdaljena baza — test kupci i porudžbine se preskaču. Gotovo.');
    process.exit(0);
  }

  const customerIds: string[] = [];
  for (const u of USERS) {
    const id = await createUser({ ...u, password: TEST_USER_PASSWORD });
    await db
      .update(user)
      .set({
        phone: u.phone,
        street: u.street,
        streetNumber: u.streetNumber,
        postalCode: u.postalCode,
        city: u.city,
      })
      .where(eq(user.id, id));
    customerIds.push(id);
    console.log(`   korisnik: ${u.email} / ${TEST_USER_PASSWORD}`);
  }

  console.log('── Porudžbine');
  const bySlug = new Map(productRows.map((p) => [p.slug, p]));
  const pick = (name: string) => {
    const p = bySlug.get(slugify(name));
    if (!p) throw new Error(`Nepoznat proizvod: ${name}`);
    return p;
  };

  const sampleOrders = [
    { who: 0, days: 1, status: 'primljena', delivery: 'kurir', items: [['Lanena haljina spuštenih ramena', 'M', 1], ['Roze torbica na lanac', null, 1]] },
    { who: 1, days: 3, status: 'u_obradi', delivery: 'kurir', items: [['Bela košulja slim fit', 'L', 2], ['Farmerke straight fit', '32', 1]] },
    { who: 2, days: 6, status: 'poslata', delivery: 'kurir', items: [['Kaput sa kaišem', 'S', 1]] },
    { who: 0, days: 12, status: 'isporucena', delivery: 'preuzimanje', items: [['Plisirana midi suknja', 'S', 1], ['Pamučna majica basic', 'S', 2]] },
    { who: null, days: 2, status: 'primljena', delivery: 'kurir', items: [['Kožni ranac', null, 1]] },
    { who: 1, days: 20, status: 'otkazana', delivery: 'kurir', items: [['Kožna jakna', 'M', 1]] },
  ] as const;

  for (const o of sampleOrders) {
    const customer = o.who === null ? null : USERS[o.who];
    const lines = o.items.map(([name, size, quantity]) => {
      const p = pick(name);
      return {
        productId: p.id,
        name: p.name,
        image: p.images[0] ?? null,
        price: p.price,
        size,
        color: p.color,
        quantity,
      };
    });
    const itemsTotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const deliveryCost = o.delivery === 'kurir' ? DELIVERY_COST : 0;
    const createdAt = new Date(now - o.days * 24 * 60 * 60 * 1000);
    const [order] = await db
      .insert(orders)
      .values({
        userId: o.who === null ? null : customerIds[o.who],
        email: customer?.email ?? 'gost.kupac@example.com',
        firstName: customer?.name ?? 'Milan',
        lastName: customer?.lastName ?? 'Gostović',
        phone: customer?.phone ?? '060 111 2233',
        street: o.delivery === 'kurir' ? (customer?.street ?? 'Cara Dušana') : null,
        streetNumber: o.delivery === 'kurir' ? (customer?.streetNumber ?? '7') : null,
        postalCode: o.delivery === 'kurir' ? (customer?.postalCode ?? '34000') : null,
        city: o.delivery === 'kurir' ? (customer?.city ?? 'Kragujevac') : null,
        delivery: o.delivery,
        payment: 'pouzece',
        status: o.status,
        itemsTotal,
        deliveryCost,
        total: itemsTotal + deliveryCost,
        createdAt,
        updatedAt: createdAt,
      })
      .returning();
    await db.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));
  }
  console.log(`   ${sampleOrders.length} porudžbina`);

  console.log('\nGotovo.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
