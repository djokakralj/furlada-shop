import type { Product, Subcategory } from '@/db/schema';

// Minimalan skup podataka o proizvodu koji ide u klijentske komponente
export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sizes: string[];
  color: string;
  subcategory: string;
  isNew: boolean;
};

const NEW_DAYS = 14;

export function toCardProduct(p: Product & { subcategory: Subcategory }): CardProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    sizes: p.sizes,
    color: p.color,
    subcategory: p.subcategory.name,
    isNew: Date.now() - p.createdAt.getTime() < NEW_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return null;
  return Math.round((1 - price / compareAt) * 100);
}
