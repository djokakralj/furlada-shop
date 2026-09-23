import { relations, sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

// ─── Auth (Better Auth core šema + naša dodatna polja na user) ───────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // ime
  lastName: text('last_name'),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  phone: text('phone'),
  street: text('street'),
  streetNumber: text('street_number'),
  postalCode: text('postal_code'),
  city: text('city'),
  ...timestamps,
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ...timestamps,
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps,
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

// Better Auth rate limit (za /api/auth/* endpointe) — u bazi, jer na
// serverless-u memorija nije deljena između instanci
export const rateLimit = pgTable('rate_limit', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  count: integer('count').notNull(),
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
});

// Naš limiter za server akcije (prijava, registracija, poručivanje…)
export const actionLimits = pgTable('action_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
});

// ─── Katalog ────────────────────────────────────────────────────────────────

export const categoryEnum = pgEnum('category', ['odeca', 'aksesoari']);
export const genderEnum = pgEnum('gender', ['zene', 'muskarci', 'unisex']);

// Vrsta proizvoda (Haljine, Majice, Tašna…) sa svojim dozvoljenim veličinama
// i bojama. Zamenjuje hardkodovane liste + Firestore kolekciju "attributes".
export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: categoryEnum('category').notNull(),
  sizes: text('sizes').array().notNull().default(sql`'{}'::text[]`),
  colors: text('colors').array().notNull().default(sql`'{}'::text[]`),
  position: integer('position').notNull().default(0),
  ...timestamps,
});

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    details: text('details'), // sastav, održavanje…
    brand: text('brand'),
    price: integer('price').notNull(), // RSD
    compareAtPrice: integer('compare_at_price'), // stara cena za akcije
    subcategoryId: integer('subcategory_id')
      .notNull()
      .references(() => subcategories.id, { onDelete: 'restrict' }),
    gender: genderEnum('gender').notNull().default('unisex'),
    color: text('color').notNull(),
    sizes: text('sizes').array().notNull().default(sql`'{}'::text[]`),
    images: text('images').array().notNull().default(sql`'{}'::text[]`),
    featured: boolean('featured').notNull().default(false),
    active: boolean('active').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    index('products_subcategory_idx').on(t.subcategoryId),
    index('products_created_idx').on(t.createdAt),
  ],
);

// ─── Porudžbine ─────────────────────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
  'primljena',
  'u_obradi',
  'poslata',
  'isporucena',
  'otkazana',
]);
export const deliveryEnum = pgEnum('delivery_method', ['kurir', 'preuzimanje']);
export const paymentEnum = pgEnum('payment_method', ['pouzece']);

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Čitljiv broj porudžbine za kupca i admina (#1001, #1002…)
    number: integer('number').generatedAlwaysAsIdentity({ startWith: 1001 }).notNull().unique(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    phone: text('phone').notNull(),
    // Adresa je null za lično preuzimanje
    street: text('street'),
    streetNumber: text('street_number'),
    postalCode: text('postal_code'),
    city: text('city'),
    note: text('note'),
    delivery: deliveryEnum('delivery').notNull(),
    payment: paymentEnum('payment').notNull(),
    status: orderStatusEnum('status').notNull().default('primljena'),
    itemsTotal: integer('items_total').notNull(),
    deliveryCost: integer('delivery_cost').notNull(),
    total: integer('total').notNull(),
    ...timestamps,
  },
  (t) => [
    index('orders_user_idx').on(t.userId),
    index('orders_status_idx').on(t.status),
    index('orders_created_idx').on(t.createdAt),
  ],
);

// Stavke čuvaju snimak naziva/cene u trenutku kupovine — izmena ili brisanje
// proizvoda kasnije ne menja istoriju porudžbina.
export const orderItems = pgTable(
  'order_items',
  {
    id: serial('id').primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    image: text('image'),
    price: integer('price').notNull(),
    size: text('size'),
    color: text('color'),
    quantity: integer('quantity').notNull(),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
);

// ─── Relacije ───────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  orders: many(orders),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const subcategoryRelations = relations(subcategories, ({ many }) => ({
  products: many(products),
}));

export const productRelations = relations(products, ({ one }) => ({
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(user, { fields: [orders.userId], references: [user.id] }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export type User = typeof user.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type Category = (typeof categoryEnum.enumValues)[number];
export type Gender = (typeof genderEnum.enumValues)[number];
export type DeliveryMethod = (typeof deliveryEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentEnum.enumValues)[number];
