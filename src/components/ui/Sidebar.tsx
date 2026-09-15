import React from 'react';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export async function Sidebar() {
  const session = await getSession();
  const isAdmin = session?.roles.includes('ADMIN') || session?.roles.includes('SUPER_ADMIN');

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-gray-800">
        ACM System
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          <li>
            <Link href="/" className="block px-3 py-2 rounded-md hover:bg-gray-800">Dashboard</Link>
          </li>
          <li>
            <Link href="/components" className="block px-3 py-2 rounded-md hover:bg-gray-800">Components</Link>
          </li>
          <li>
            <Link href="/kits" className="block px-3 py-2 rounded-md hover:bg-gray-800">Kits</Link>
          </li>
          <li>
            <Link href="/loans" className="block px-3 py-2 rounded-md hover:bg-gray-800">My Loans</Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link href="/admin/dashboard" className="block px-3 py-2 rounded-md text-blue-300 hover:bg-gray-800">Admin Dashboard</Link>
              </li>
              <li>
                <Link href="/admin/users" className="block px-3 py-2 rounded-md text-blue-300 hover:bg-gray-800">Manage Users</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
