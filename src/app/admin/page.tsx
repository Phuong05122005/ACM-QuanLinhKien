
import React from 'react';
import { getSession, requireRole } from '@/lib/auth';
import { pool } from '@/lib/pg';
import { Package, Users, AlertTriangle, Download, RefreshCw, ClipboardList, AlertCircle, ArrowRight, ShieldCheck, Database } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 60; // Refresh at most every minute

export default async function AdminDashboard() {
  await requireRole(['ADMIN', 'SUPER_ADMIN']);
  
  // Primary Metrics
  const activeLoansRes = await pool.query(`
    SELECT COALESCE(SUM(quantity), 0) as total_components_borrowed
    FROM loan_items li
    JOIN loans l ON li.loan_id = l.id
    WHERE l.status = 'BORROWED'
  `);
  const totalComponentsBorrowed = activeLoansRes.rows[0].total_components_borrowed;

  const activeUsersRes = await pool.query(`
    SELECT COUNT(DISTINCT user_id) as active_users
    FROM loans
    WHERE status = 'BORROWED'
  `);
  const activeUsers = activeUsersRes.rows[0].active_users;

  const aiDiscrepancyRes = await pool.query(`
    SELECT COUNT(*) as discrepancy_count
    FROM ai_scans
    WHERE status != 'NORMAL'
      AND id NOT IN (SELECT scan_id FROM ai_reviews)
  `);
  const aiDiscrepancy = aiDiscrepancyRes.rows[0].discrepancy_count;

  // Secondary Metrics
  const pendingLoansRes = await pool.query(`SELECT COUNT(*) as count FROM loans WHERE status = 'PENDING'`);
  const pendingLoans = pendingLoansRes.rows[0].count;

  const openDisputesRes = await pool.query(`SELECT COUNT(*) as count FROM disputes WHERE status = 'PENDING_REVIEW'`);
  const openDisputes = openDisputesRes.rows[0].count;

  return (
    <div className="space-y-8 pb-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Quản trị</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Tổng quan tình hình mượn/trả và tài sản hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <form action="/api/reports/export" method="GET">
            <button type="submit" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm active:scale-[0.98]">
              <Download className="h-4 w-4 text-slate-500" />
              <span>Xuất báo cáo (CSV)</span>
            </button>
          </form>
          <a href="/admin" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 transition-all font-medium text-sm active:scale-[0.98]">
            <RefreshCw className="h-4 w-4" />
            <span>Làm mới</span>
          </a>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Package className="w-24 h-24 text-blue-600" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl shadow-inner border border-blue-100/50">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-slate-600 font-semibold text-[15px]">Linh kiện đang cho mượn</h3>
          </div>
          <p className="text-4xl font-bold text-slate-900 mt-2 relative z-10">{totalComponentsBorrowed}</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <Users className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner border border-indigo-100/50">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-slate-600 font-semibold text-[15px]">Người dùng đang mượn</h3>
          </div>
          <p className="text-4xl font-bold text-slate-900 mt-2 relative z-10">{activeUsers}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
            <AlertTriangle className="w-24 h-24 text-red-600" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="p-3.5 bg-red-50 text-red-600 rounded-xl shadow-inner border border-red-100/50">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-slate-600 font-semibold text-[15px]">Linh kiện hỏng/thiếu (AI)</h3>
          </div>
          <p className="text-4xl font-bold text-red-600 mt-2 relative z-10">{aiDiscrepancy}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary Metrics */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Đơn chờ xử lý</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{pendingLoans}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <ClipboardList className="h-6 w-6 text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Kiểm kê AI chờ duyệt</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{aiDiscrepancy}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <AlertCircle className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-amber-200 transition-colors">
            <div>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Khiếu nại đang mở</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{openDisputes}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
              <AlertTriangle className="h-6 w-6 text-slate-400 group-hover:text-amber-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <Database className="w-64 h-64 text-slate-900" />
          </div>
          
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            Tiện ích thao tác nhanh
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            <Link href="/admin/loans" className="flex flex-col p-5 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <ClipboardList className="h-5 w-5" />
              </div>
              <span className="text-slate-800 font-semibold text-sm">Duyệt đơn mượn</span>
              <span className="text-slate-500 text-xs mt-1">Xử lý yêu cầu mượn linh kiện</span>
            </Link>
            
            <Link href="/admin/ai-inspections" className="flex flex-col p-5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                <AlertCircle className="h-5 w-5" />
              </div>
              <span className="text-slate-800 font-semibold text-sm">Kiểm tra AI</span>
              <span className="text-slate-500 text-xs mt-1">Rà soát sai lệch khi sinh viên trả đồ</span>
            </Link>
            
            <Link href="/admin/inventory" className="flex flex-col p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-slate-800 font-semibold text-sm">Quản lý kho</span>
              <span className="text-slate-500 text-xs mt-1">Thêm, sửa, xóa linh kiện và thiết bị</span>
            </Link>
            
            <Link href="/admin/disputes" className="flex flex-col p-5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all group">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-slate-800 font-semibold text-sm">Xem khiếu nại</span>
              <span className="text-slate-500 text-xs mt-1">Xử lý báo cáo hỏng hóc, mất đồ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
