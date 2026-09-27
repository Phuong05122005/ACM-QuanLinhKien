
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Package, Box, QrCode, ClipboardList, AlertTriangle, Users, Settings, Activity, FileText, Bell, Search, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';

const ADMIN_NAV = [
  { group: 'Chính', items: [{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard }] },
  { group: 'Mượn & Trả', items: [
    { name: 'Đơn mượn', href: '/admin/loans', icon: ClipboardList },
    { name: 'Khiếu nại', href: '/admin/disputes', icon: AlertTriangle },
  ]},
  { group: 'Kho & Tài sản', items: [
    { name: 'Danh mục linh kiện', href: '/admin/components', icon: Package },
    { name: 'Lịch sử kho (Inventory)', href: '/admin/inventory', icon: Activity },
    { name: 'Bộ dụng cụ (Kits)', href: '/admin/kits', icon: Box },
    { name: 'QR & Thiết bị', href: '/admin/qr', icon: QrCode },
  ]},
  { group: 'AI & Kiểm soát', items: [
    { name: 'Kiểm kê AI', href: '/admin/ai-inspections', icon: Search },
  ]},
  { group: 'Báo cáo', items: [
    { name: 'Báo cáo mượn/trả', href: '/admin/reports', icon: FileText },
    { name: 'Nhật ký hoạt động', href: '/admin/audit-logs', icon: Activity },
  ]},
  { group: 'Người dùng', items: [
    { name: 'Người dùng & Phân quyền', href: '/admin/users', icon: Users },
  ]},
  { group: 'Hệ thống', items: [
    { name: 'Thông báo', href: '/admin/settings/notifications', icon: Bell },
    { name: 'Cấu hình hệ thống', href: '/admin/settings', icon: Settings },
    { name: 'Vận hành khẩn cấp', href: '/admin/emergency', icon: ShieldAlert },
  ]},
];

const STUDENT_NAV = [
  { group: 'Chính', items: [{ name: 'Dashboard', href: '/', icon: LayoutDashboard }] },
  { group: 'Mượn', items: [
    { name: 'Đăng ký mượn', href: '/loans/new', icon: Box },
    { name: 'Đơn mượn của tôi', href: '/loans', icon: ClipboardList },
  ]},
  { group: 'Nhận & Trả', items: [
    { name: 'Xác thực nhận Kit', href: '/loans/pickup', icon: QrCode },
    { name: 'Trả Kit', href: '/loans/return', icon: Package },
  ]},
  { group: 'Khác', items: [
    { name: 'Khiếu nại', href: '/disputes', icon: AlertTriangle },
    { name: 'Thông báo', href: '/notifications', icon: Bell },
  ]},
];

export function AppShellClient({ children, isAdmin, username }: { children: React.ReactNode; isAdmin: boolean; username: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const navGroups = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message ?? "Logout failed");
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none border-r border-slate-800/50",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Box className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">ACM System</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white transition-colors p-1" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-600">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-6 px-4">
              <h3 className="mb-3 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{group.group}</h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/' && item.href !== '/admin');
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                          isActive 
                            ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20" 
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                        )}
                      >
                        <Icon className={clsx("h-[18px] w-[18px] flex-shrink-0 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                        <span className="text-[14px] truncate tracking-wide">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-slate-50/50">
        {/* Topbar */}
        <header className="h-[72px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-30">
          <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl -ml-2 transition-colors" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center gap-3 mr-2 pr-4 border-r border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-slate-500 font-medium leading-none mb-1">Xin chào,</span>
                <span className="text-sm text-slate-900 font-bold leading-none">{username}</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium" title="Đăng xuất">
              <LogOut className="h-5 w-5" />
              <span className="text-[14px] hidden sm:block">Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
