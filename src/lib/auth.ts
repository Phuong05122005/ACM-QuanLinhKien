import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-dev');
const ALGORITHM = 'HS256';

export interface SessionPayload {
  userId: string;
  username: string;
  studentId: string | null;
  roles: string[];
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as unknown as import('jose').JWTPayload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionPayload;
  } catch (error: unknown) {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt(payload);

  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession() {
  (await cookies()).set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;
  return await decrypt(sessionCookie);
}

export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  
  const hasRole = session.roles.some((role) => allowedRoles.includes(role));
  if (!hasRole) {
    throw new Error('FORBIDDEN');
  }
  
  return session;
}

export async function requireOwnership(userId: string) {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  
  if (session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN')) {
    return session;
  }
  
  if (session.userId !== userId) {
    throw new Error('FORBIDDEN');
  }
  
  return session;
}
