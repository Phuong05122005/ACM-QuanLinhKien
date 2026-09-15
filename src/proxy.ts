import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-dev');

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/health') ||
    pathname === '/login' ||
    pathname === '/unauthorized' ||
    pathname === '/forbidden' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const roles = payload.roles as string[];

    // Check admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (!roles.includes('ADMIN') && !roles.includes('SUPER_ADMIN')) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/forbidden', request.url));
      }
    }

    return NextResponse.next();
  } catch (error: unknown) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
