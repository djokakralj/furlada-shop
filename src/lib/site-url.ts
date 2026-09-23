// Javna adresa sajta. Redosled:
// 1. NEXT_PUBLIC_SITE_URL (postavljeno ručno — produkcijski domen, lokalno localhost)
// 2. Vercel produkcija: VERCEL_PROJECT_PRODUCTION_URL
// 3. Vercel preview: adresa grane (VERCEL_BRANCH_URL) — da prijava i linkovi
//    u emailovima rade i na preview deploy-ima
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === 'production' && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

// Sve adrese sa kojih je dozvoljeno slati zahteve za prijavu (Better Auth
// odbija forme sa nepoznatog origina)
export function getTrustedOrigins() {
  const urls = [
    getSiteUrl(),
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
  ];
  return [...new Set(urls.filter((u): u is string => !!u))];
}
