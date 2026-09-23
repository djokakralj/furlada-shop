import 'server-only';
import { and, asc, count, desc, eq, gte, ilike, ne, or, sql, sum, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders, products, subcategories, user, type OrderStatus } from '@/db/schema';

const DAY = 24 * 60 * 60 * 1000;

export async function getDashboardData() {
  const since30 = new Date(Date.now() - 30 * DAY);
  const since14 = new Date(Date.now() - 13 * DAY);
  since14.setHours(0, 0, 0, 0);
  const notCanceled = ne(orders.status, 'otkazana');

  const [[revenue], [newOrders], [activeProducts], [customers], daily, recent, top] = await Promise.all([
    db
      .select({ total: sum(orders.total).mapWith(Number), count: count() })
      .from(orders)
      .where(and(notCanceled, gte(orders.createdAt, since30))),
    db.select({ value: count() }).from(orders).where(eq(orders.status, 'primljena')),
    db.select({ value: count() }).from(products).where(eq(products.active, true)),
    db.select({ value: count() }).from(user),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${orders.createdAt} at time zone 'Europe/Belgrade'), 'YYYY-MM-DD')`,
        total: sum(orders.total).mapWith(Number),
        count: count(),
      })
      .from(orders)
      .where(and(notCanceled, gte(orders.createdAt, since14)))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.query.orders.findMany({ orderBy: [desc(orders.createdAt)], limit: 6 }),
    db
      .select({
        productId: orderItems.productId,
        name: orderItems.name,
        image: sql<string | null>`max(${orderItems.image})`,
        quantity: sum(orderItems.quantity).mapWith(Number),
        revenue: sql<number>`sum(${orderItems.price} * ${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(notCanceled, gte(orders.createdAt, since30)))
      .groupBy(orderItems.productId, orderItems.name)
      .orderBy(desc(sql`4`))
      .limit(5),
  ]);

  // Popuni dane bez porudžbina nulom da grafikon ima svih 14 dana
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since14.getTime() + i * DAY);
    const key = d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Belgrade' }); // YYYY-MM-DD
    return { day: key, date: d, total: byDay.get(key)?.total ?? 0, count: byDay.get(key)?.count ?? 0 };
  });

  return {
    revenue30: revenue.total ?? 0,
    orders30: revenue.count,
    newOrders: newOrders.value,
    activeProducts: activeProducts.value,
    customers: customers.value,
    days,
    recent,
    top,
  };
}

export const ADMIN_PAGE_SIZE = 20;

export async function getAdminOrders({ status, q, page }: { status?: OrderStatus; q?: string; page: number }) {
  const conds: SQL[] = [];
  if (status) conds.push(eq(orders.status, status));
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, '\\$&')}%`;
    const num = Number(q.replace('#', ''));
    conds.push(
      or(
        ilike(orders.email, pattern),
        ilike(sql`${orders.firstName} || ' ' || ${orders.lastName}`, pattern),
        ilike(orders.phone, pattern),
        Number.isInteger(num) && num > 0 ? eq(orders.number, num) : undefined,
      )!,
    );
  }
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ total }], counts] = await Promise.all([
    db.query.orders.findMany({
      where,
      with: { items: { columns: { quantity: true } } },
      orderBy: [desc(orders.createdAt)],
      limit: ADMIN_PAGE_SIZE,
      offset: (page - 1) * ADMIN_PAGE_SIZE,
    }),
    db.select({ total: count() }).from(orders).where(where),
    db.select({ status: orders.status, value: count() }).from(orders).groupBy(orders.status),
  ]);

  return {
    orders: rows,
    total,
    counts: Object.fromEntries(counts.map((c) => [c.status, c.value])) as Partial<Record<OrderStatus, number>>,
  };
}

export async function getAdminOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: { with: { product: { columns: { slug: true } } } }, user: { columns: { id: true, email: true } } },
  });
  return order ?? null;
}

export async function getAdminProducts({
  q,
  subcategoryId,
  status,
  page,
}: {
  q?: string;
  subcategoryId?: number;
  status?: 'aktivni' | 'skriveni' | 'izdvojeni' | 'akcija';
  page: number;
}) {
  const conds: SQL[] = [];
  if (q) conds.push(ilike(products.name, `%${q.replace(/[%_\\]/g, '\\$&')}%`));
  if (subcategoryId) conds.push(eq(products.subcategoryId, subcategoryId));
  if (status === 'aktivni') conds.push(eq(products.active, true));
  if (status === 'skriveni') conds.push(eq(products.active, false));
  if (status === 'izdvojeni') conds.push(eq(products.featured, true));
  if (status === 'akcija') conds.push(sql`${products.compareAtPrice} is not null`);
  const where = conds.length ? and(...conds) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ product: products, subcategory: subcategories })
      .from(products)
      .innerJoin(subcategories, eq(products.subcategoryId, subcategories.id))
      .where(where)
      .orderBy(desc(products.createdAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset((page - 1) * ADMIN_PAGE_SIZE),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return { products: rows.map((r) => ({ ...r.product, subcategory: r.subcategory })), total };
}

export async function getAdminProduct(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [p] = await db.select().from(products).where(eq(products.id, id));
  return p ?? null;
}

export async function getSubcategoriesWithCounts() {
  return db
    .select({ sub: subcategories, productCount: count(products.id) })
    .from(subcategories)
    .leftJoin(products, eq(products.subcategoryId, subcategories.id))
    .groupBy(subcategories.id)
    .orderBy(asc(subcategories.category), asc(subcategories.position), asc(subcategories.name));
}

export async function getAdminUsers(q?: string) {
  const pattern = q ? `%${q.replace(/[%_\\]/g, '\\$&')}%` : null;
  return db
    .select({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      city: user.city,
      createdAt: user.createdAt,
      orderCount: count(orders.id),
      spent: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status} <> 'otkazana'), 0)::int`,
    })
    .from(user)
    .leftJoin(orders, eq(orders.userId, user.id))
    .where(
      pattern
        ? or(ilike(user.email, pattern), ilike(sql`${user.name} || ' ' || coalesce(${user.lastName}, '')`, pattern))
        : undefined,
    )
    .groupBy(user.id)
    .orderBy(desc(user.createdAt));
}
