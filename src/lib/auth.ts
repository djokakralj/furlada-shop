import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sendEmail } from '@/lib/email';
import { getSiteUrl, getTrustedOrigins } from '@/lib/site-url';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? getSiteUrl(),
  trustedOrigins: getTrustedOrigins(),
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Nakon registracije korisnik je odmah ulogovan; verifikacija emaila se šalje
    // ali ne blokira kupovinu (gost ionako može da poruči bez naloga).
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Furlada — nova lozinka',
        text: `Zdravo ${user.name},\n\nZa postavljanje nove lozinke otvorite link:\n${url}\n\nAko niste tražili promenu lozinke, ignorišite ovaj email.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Furlada — potvrdite email adresu',
        text: `Zdravo ${user.name},\n\nPotvrdite email adresu otvaranjem linka:\n${url}`,
      });
    },
  },
  user: {
    additionalFields: {
      lastName: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      // input: false — korisnik ne može sam sebi da postavi ulogu kroz signUp
      role: { type: 'string', required: false, defaultValue: 'user', input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dana
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [nextCookies()], // mora biti poslednji
});

export type Session = typeof auth.$Infer.Session;
