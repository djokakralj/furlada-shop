import type { Category, DeliveryMethod, Gender, OrderStatus, PaymentMethod } from '@/db/schema';

export const DELIVERY_COST = 300; // RSD, kurirska dostava

// Srpski naziv boje -> hex (tačkice u filterima, admin paleta)
export const COLORS: Record<string, string> = {
  crna: '#111111',
  bela: '#ffffff',
  siva: '#9e9e9e',
  bež: '#d8c3a5',
  braon: '#7b4a2e',
  crvena: '#c62828',
  bordo: '#6d1a2a',
  roze: '#f2a7b8',
  narandžasta: '#ef7d22',
  žuta: '#f4d03f',
  zelena: '#4f8a4b',
  maslinasta: '#6b705c',
  plava: '#1f4e8c',
  tirkizna: '#48c9b0',
  ljubičasta: '#6c3483',
  jeans: '#5d6d7e',
  zlatna: '#c9a96e',
  srebrna: '#c0c0c0',
};

export const ALL_COLORS = Object.keys(COLORS);

export const CATEGORY_LABEL: Record<Category, string> = {
  odeca: 'Odeća',
  aksesoari: 'Aksesoari',
};

export const GENDER_LABEL: Record<Gender, string> = {
  zene: 'Žene',
  muskarci: 'Muškarci',
  unisex: 'Unisex',
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  primljena: 'Primljena',
  u_obradi: 'U obradi',
  poslata: 'Poslata',
  isporucena: 'Isporučena',
  otkazana: 'Otkazana',
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABEL) as OrderStatus[];

export const DELIVERY_LABEL: Record<DeliveryMethod, string> = {
  kurir: 'Kurirska dostava',
  preuzimanje: 'Lično preuzimanje',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  pouzece: 'Plaćanje pouzećem',
};

// Redosled veličina za sortiranje filtera (brojevi idu posle, numerički)
export const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const DEFAULT_CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = {
  preporuceno: 'Preporučeno',
  najnovije: 'Najnovije',
  'cena-rastuce': 'Cena: od najniže',
  'cena-opadajuce': 'Cena: od najviše',
} as const;
export type SortOption = keyof typeof SORT_OPTIONS;

export const STORE = {
  name: 'Furlada',
  email: 'furladagr@gmail.com',
  phone: '+381 61 234 5678',
  phoneHref: 'tel:+381612345678',
  instagram: 'https://www.instagram.com/furlada/',
  instagramHandle: '@furlada',
  hours: 'Pon – Pet: 09:00 – 17:00',
};
