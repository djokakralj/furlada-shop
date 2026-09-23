'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { orderItems, orders, products, user } from '@/db/schema';
import { DELIVERY_COST } from '@/lib/constants';
import { sendEmail } from '@/lib/email';
import { allow, clientIp, TOO_MANY } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/session';
import { getSiteUrl } from '@/lib/site-url';
import { formatPrice, orderNumber } from '@/lib/utils';
import { checkoutSchema, fieldErrors, type ActionResult } from '@/lib/validation';

export async function placeOrder(input: unknown): Promise<ActionResult<{ orderId: string }>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: 'Proverite označena polja.', fieldErrors: fieldErrors(parsed.error) };
  }
  const data = parsed.data;
  // Zaštita od spam porudžbina (bot koji zasipa admina lažnim porudžbinama)
  if (!(await allow(`order:${await clientIp()}`, 10, 60 * 60))) return { ok: false, error: TOO_MANY };
  const currentUser = await getCurrentUser();

  // Cene i dostupnost se UVEK čitaju iz baze — nikad ne verujemo klijentu
  const ids = [...new Set(data.items.map((i) => i.productId))];
  const rows = await db
    .select()
    .from(products)
    .where(and(inArray(products.id, ids), eq(products.active, true)));
  const byId = new Map(rows.map((p) => [p.id, p]));

  const lines: Omit<typeof orderItems.$inferInsert, 'orderId'>[] = [];
  for (const item of data.items) {
    const p = byId.get(item.productId);
    if (!p) return { ok: false, error: 'Neki proizvod iz korpe više nije dostupan. Osvežite korpu.' };
    const sizeOk = p.sizes.length === 0 ? item.size === null : item.size !== null && p.sizes.includes(item.size);
    if (!sizeOk) return { ok: false, error: `Veličina za „${p.name}“ nije dostupna. Osvežite korpu.` };
    lines.push({
      productId: p.id,
      name: p.name,
      image: p.images[0] ?? null,
      price: p.price,
      size: item.size,
      color: p.color,
      quantity: item.quantity,
    });
  }

  const itemsTotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const deliveryCost = data.delivery === 'kurir' ? DELIVERY_COST : 0;
  const courier = data.delivery === 'kurir';

  const order = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        userId: currentUser?.id ?? null,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        street: courier ? data.street! : null,
        streetNumber: courier ? data.streetNumber! : null,
        postalCode: courier ? data.postalCode! : null,
        city: courier ? data.city! : null,
        note: data.note || null,
        delivery: data.delivery,
        payment: 'pouzece',
        itemsTotal,
        deliveryCost,
        total: itemsTotal + deliveryCost,
      })
      .returning({ id: orders.id, number: orders.number });

    await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));

    if (currentUser && data.saveAddress) {
      await tx
        .update(user)
        .set({
          lastName: data.lastName,
          phone: data.phone,
          ...(courier
            ? { street: data.street, streetNumber: data.streetNumber, postalCode: data.postalCode, city: data.city }
            : {}),
        })
        .where(eq(user.id, currentUser.id));
    }
    return order;
  });

  const siteUrl = getSiteUrl();
  await sendEmail({
    to: data.email,
    subject: `Furlada — porudžbina ${orderNumber(order.number)} je primljena`,
    text: [
      `Zdravo ${data.firstName},`,
      '',
      `hvala na porudžbini! Primili smo porudžbinu ${orderNumber(order.number)}:`,
      '',
      ...lines.map(
        (l) => `• ${l.name}${l.size ? ` (${l.size})` : ''} × ${l.quantity} — ${formatPrice(l.price * l.quantity)}`,
      ),
      '',
      `Dostava: ${deliveryCost ? formatPrice(deliveryCost) : 'besplatno (lično preuzimanje)'}`,
      `Ukupno za plaćanje pouzećem: ${formatPrice(itemsTotal + deliveryCost)}`,
      '',
      `Status porudžbine možete pratiti na: ${siteUrl}/porudzbina/${order.id}`,
    ].join('\n'),
  }).catch(() => {}); // neuspelo slanje emaila ne sme da obori porudžbinu

  return { ok: true, data: { orderId: order.id } };
}
