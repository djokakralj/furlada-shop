import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { getCurrentUser } from '@/lib/session';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Porudžbinu vidi: njen vlasnik, admin, ili — za porudžbine gostiju — onaj
// ko ima link (UUID se ne može pogoditi). Porudžbinu registrovanog kupca
// niko drugi ne može da otvori samo preko linka.
export async function getOrderForViewer(id: string) {
  if (!UUID.test(id)) return null;
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: { with: { product: { columns: { slug: true } } } } },
  });
  if (!order) return null;
  if (!order.userId) return order;
  const viewer = await getCurrentUser();
  if (viewer && (viewer.id === order.userId || viewer.role === 'admin')) return order;
  return null;
}

export async function getUserOrders(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: { with: { product: { columns: { slug: true } } } } },
    orderBy: [desc(orders.createdAt)],
  });
}
