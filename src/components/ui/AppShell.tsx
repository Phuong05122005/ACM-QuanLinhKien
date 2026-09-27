import React from 'react';
import { getSession } from '@/lib/auth';
import { AppShellClient } from './AppShellClient';

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const session = await getSession();
  
  if (!session) {
    return <>{children}</>; // Render without shell if unauthenticated (e.g. /login)
  }

  const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');

  return (
    <AppShellClient isAdmin={isAdmin} username={session.username}>
      {children}
    </AppShellClient>
  );
}
