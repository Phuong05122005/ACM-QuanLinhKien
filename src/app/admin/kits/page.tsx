'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Box, Layers } from 'lucide-react';
import Link from 'next/link';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type KitItem = {
  id: string;
  name: string;
  description: string;
  code: string;
  available_kits_count: number;
};

export default function KitsAdminPage() {
  const [kits, setKits] = useState<KitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const res = await fetch(`/api/kits?search=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success) {
          setKits(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    // Simple debounce
    const timer = setTimeout(() => {
      fetchKits();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-fuchsia-50 to-pink-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bộ dụng cụ (Kits)</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-fuchsia-500" /> Quản lý các bộ combo linh kiện (Kits) dành cho môn học
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <Link href="/admin/kits/new" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 transition-all font-semibold active:scale-[0.98] w-full sm:w-auto">
            <Plus className="h-5 w-5" /> 
            <span>Thêm Kit mới</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-fuchsia-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm theo tên bộ dụng cụ hoặc mã..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-fuchsia-500/15 focus:border-fuchsia-500 transition-all shadow-sm hover:border-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[12px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tên / Mã Kit</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Khả năng đáp ứng (Sẵn có)</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <LoadingSkeleton className="h-5 w-48 rounded-md" />
                        <LoadingSkeleton className="h-4 w-24 rounded-md" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-4 w-64 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-32 rounded-full" /></td>
                    <td className="px-6 py-5 flex justify-end"><LoadingSkeleton className="h-8 w-8 rounded-lg" /></td>
                  </tr>
                ))
              ) : kits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Box className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy Bộ dụng cụ</h3>
                      <p className="text-slate-500">Chưa có Kit nào được tạo hoặc không khớp với từ khóa của bạn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                kits.map(kit => (
                  <tr key={kit.id} className="hover:bg-fuchsia-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-[15px]">{kit.name}</div>
                      <div className="text-[13px] font-mono text-slate-500 mt-1">{kit.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-slate-500" title={kit.description}>
                        {kit.description || <span className="italic text-slate-400">Không có mô tả</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border ${
                        kit.available_kits_count > 0 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-100 text-rose-700 border-rose-200'
                      }`}>
                        Có thể mượn: {kit.available_kits_count} bộ
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/kits/${kit.id}`} 
                        className="inline-flex items-center justify-center w-9 h-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-xl transition-all shadow-sm active:scale-95"
                        title="Chỉnh sửa Kit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
