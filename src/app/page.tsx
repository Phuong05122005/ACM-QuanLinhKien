import React from 'react';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Package, ClipboardList, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { pool } from '@/lib/pg';

export default async function StudentDashboard() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  if (session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN')) {
    redirect('/admin');
  }

  // Fetch student stats
  const statsRes = await pool.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status IN ('PENDING', 'APPROVED', 'READY_FOR_PICKUP')) as pending_loans,
      COUNT(*) FILTER (WHERE status = 'BORROWED') as active_loans
    FROM loans
    WHERE user_id = $1
  `, [session.userId]);

  const { pending_loans, active_loans } = statsRes.rows[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">Xin chào, {session.username}!</h1>
        <p className="text-blue-100 mb-6 max-w-xl text-lg">Chào mừng bạn đến với Hệ thống Quản lý Linh kiện. Đăng ký mượn mới hoặc theo dõi trạng thái các đơn hiện tại.</p>
        <Link href="/loans/new" className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-sm transition-all">
          <Package className="h-5 w-5" />
          <span>Đăng ký mượn linh kiện</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Đơn đang chờ xử lý</h3>
            <p className="text-3xl font-bold text-slate-900">{pending_loans || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-slate-500 font-medium mb-1">Đang mượn</h3>
            <p className="text-3xl font-bold text-slate-900">{active_loans || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Tiện ích nhanh</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/loans" className="flex flex-col items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-all text-slate-700">
            <ClipboardList className="h-8 w-8 mb-2 text-blue-600" />
            <span className="font-medium text-sm text-center">Quản lý Đơn mượn</span>
          </Link>
          <Link href="/loans/pickup" className="flex flex-col items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-all text-slate-700">
            <Calendar className="h-8 w-8 mb-2 text-indigo-600" />
            <span className="font-medium text-sm text-center">Xác thực Nhận Kit</span>
          </Link>
          <Link href="/disputes" className="flex flex-col items-center p-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-300 transition-all text-slate-700">
            <AlertCircle className="h-8 w-8 mb-2 text-amber-600" />
            <span className="font-medium text-sm text-center">Tạo Khiếu nại</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
