import { SIZE_ORDER } from '@/lib/constants';

const priceFormatter = new Intl.NumberFormat('sr-Latn-RS');

export function formatPrice(value: number) {
  return `${priceFormatter.format(value)} RSD`;
}

export function formatDate(date: Date, withTime = false) {
  return new Intl.DateTimeFormat('sr-Latn-RS', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Belgrade',
  }).format(date);
}

const LATIN_MAP: Record<string, string> = { š: 's', đ: 'dj', č: 'c', ć: 'c', ž: 'z' };

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[šđčćž]/g, (ch) => LATIN_MAP[ch])
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a.toUpperCase());
    const bi = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b, 'sr', { numeric: true });
  });
}

export function orderNumber(n: number) {
  return `#${n}`;
}

// Pravilan oblik imenice uz broj: 1 proizvod, 2 proizvoda, 5 proizvoda, 21 proizvod
export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function omit<T extends object>(obj: T, ...keys: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k))) as T;
}

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
