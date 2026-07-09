import { NextResponse } from 'next/server';

async function expectedToken() {
  const secret = process.env.ACCESS_PASSWORD || '';
  const data = new TextEncoder().encode(secret + '|moljal');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login') || pathname.startsWith('/api/login') || pathname.startsWith('/api/cron') || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  const cookie = req.cookies.get('mj_auth')?.value;
  if (cookie && cookie === (await expectedToken())) return NextResponse.next();
  if (pathname.startsWith('/api/')) return new NextResponse('Unauthorized', { status: 401 });
  return NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };
