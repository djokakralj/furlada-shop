import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

// Brza (optimistička) provera: bez session kolačića nema smisla renderovati
// zaštićene stranice. Prava provera uloge je u layout-u i server akcijama.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL('/prijava', request.url);
    url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/nalog/:path*'],
};
