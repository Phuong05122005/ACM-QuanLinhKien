import React from 'react';
import { Menu, User } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { getSession } from '@/lib/auth';

export async function Topbar() {
  const session = await getSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <button className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md">
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        {session && (
          <span className="text-sm text-gray-600 font-medium">{session.username}</span>
        )}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <User className="h-5 w-5" />
        </button>
        {session && <LogoutButton />}
      </div>
    </header>
  );
}
