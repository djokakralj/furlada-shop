'use server';

import { toCardProduct, type CardProduct } from '@/lib/product';
import { getProductsByIds } from '@/lib/queries';

// Sveži podaci o proizvodima iz korpe / liste želja (cene se mogu promeniti,
// proizvod može biti sklonjen iz ponude).
export async function fetchProductsByIds(ids: string[]): Promise<CardProduct[]> {
  if (!Array.isArray(ids)) return [];
  const products = await getProductsByIds(ids.slice(0, 100).map(String));
  const byId = new Map(products.map((p) => [p.id, toCardProduct(p)]));
  // zadrži redosled iz zahteva
  return ids.map((id) => byId.get(id)).filter((p): p is CardProduct => !!p);
}
