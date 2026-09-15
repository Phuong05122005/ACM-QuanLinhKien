import React from 'react';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-4xl font-bold mb-4">Welcome to ACM</h1>
        <p className="text-gray-600 mb-8">Please log in to access the system.</p>
        <Link href="/login" className="bg-blue-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-blue-700">
          Login
        </Link>
      </div>
    );
  }

  const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <StudentDashboard userId={session.userId} />
      )}
    </div>
  );
}

// Just doing basic SSR fetches to avoid complex client component state
async function StudentDashboard({ userId }: { userId: string }) {
  // Use absolute URL or fetch via internal method? 
  // We can just fetch it if we had the full URL, or we can use the DB directly here since it's a server component.
  // Using DB directly is much faster for server components.
  const { DashboardService } = await import('@/lib/dashboard/service');
  const data = await DashboardService.getStudentDashboard(userId);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500 font-bold uppercase">Active Loans</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{data.counts.active_count || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500 font-bold uppercase">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{data.counts.pending_count || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 text-center">
          <p className="text-sm text-gray-500 font-bold uppercase">Overdue</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{data.counts.overdue_count || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 text-center flex flex-col justify-center">
          <Link href="/loans/new" className="bg-green-600 text-white font-bold py-3 px-4 rounded shadow hover:bg-green-700 block">
            Borrow a Kit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Upcoming Due</h2>
          {data.upcoming_due.length === 0 ? <p className="text-gray-500 text-sm">No upcoming due kits.</p> : (
            <ul className="space-y-2">
              {data.upcoming_due.map((l: { id: string, code?: string, loan_code?: string, status: string, expected_return_date?: string, due_date?: string }) => (
                <li key={l.id} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{l.code}</span>
                  <span className="text-sm text-red-600 font-bold">{new Date(l.expected_return_date || "").toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">You have <span className="font-bold">{data.unread_notifications}</span> unread messages.</p>
            <Link href="/notifications" className="text-blue-600 text-sm font-bold hover:underline">View All &rarr;</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

async function AdminDashboard() {
  const { DashboardService } = await import('@/lib/dashboard/service');
  const data = await DashboardService.getAdminDashboard();

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase">Pending Loans</p>
          <p className="text-3xl font-bold mt-2">{data.loans['PENDING'] || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase">Borrowed Kits</p>
          <p className="text-3xl font-bold mt-2">{data.loans['BORROWED'] || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase">Pending AI Reviews</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{data.loans['RETURN_REQUIRES_INSPECTION'] || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase">Open Disputes</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {(data.disputes['PENDING'] || 0) + (data.disputes['UNDER_REVIEW'] || 0) + (data.disputes['NEED_MORE_EVIDENCE'] || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="font-bold mb-4 border-b pb-2">Kit Inventory</h2>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>Available</span> <span className="font-bold">{data.kits['AVAILABLE'] || 0}</span></li>
            <li className="flex justify-between"><span>Reserved</span> <span className="font-bold">{data.kits['RESERVED'] || 0}</span></li>
            <li className="flex justify-between"><span>In Use</span> <span className="font-bold">{data.kits['IN_USE'] || 0}</span></li>
            <li className="flex justify-between"><span>Maintenance</span> <span className="font-bold">{data.kits['MAINTENANCE'] || 0}</span></li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="font-bold mb-4 border-b pb-2">AI Scan Categories</h2>
          <ul className="text-sm space-y-2">
            <li className="flex justify-between"><span>NORMAL</span> <span className="font-bold text-green-600">{data.ai_scans['NORMAL'] || 0}</span></li>
            <li className="flex justify-between"><span>DISCREPANCY</span> <span className="font-bold text-orange-600">{data.ai_scans['DISCREPANCY'] || 0}</span></li>
            <li className="flex justify-between"><span>MISSING</span> <span className="font-bold text-red-600">{data.ai_scans['MISSING'] || 0}</span></li>
            <li className="flex justify-between"><span>DAMAGED</span> <span className="font-bold text-red-600">{data.ai_scans['DAMAGED'] || 0}</span></li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 flex flex-col items-center justify-center">
          <h2 className="font-bold mb-4">Export Reports</h2>
          <div className="flex gap-2 flex-wrap justify-center">
            <a href="/api/reports/export?type=loans&format=csv" className="text-xs bg-gray-100 border px-3 py-2 rounded font-medium hover:bg-gray-200">Loans (CSV)</a>
            <a href="/api/reports/export?type=inventory&format=csv" className="text-xs bg-gray-100 border px-3 py-2 rounded font-medium hover:bg-gray-200">Inventory (CSV)</a>
            <a href="/api/reports/export?type=disputes&format=csv" className="text-xs bg-gray-100 border px-3 py-2 rounded font-medium hover:bg-gray-200">Disputes (CSV)</a>
          </div>
        </div>
      </div>
    </div>
  );
}
