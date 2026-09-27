'use client';
import { useState, useEffect } from 'react';
import { Search, FileText, CheckCircle, XCircle, ClipboardList, Filter } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

type Loan = {
  id: string;
  loan_code: string;
  status: string;
  student_name: string;
  created_at: string;
};

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/loans')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLoans(data.data);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      READY_FOR_PICKUP: { label: 'Chờ nhận', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
      BORROWED: { label: 'Đang mượn', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      RETURN_REQUIRES_INSPECTION: { label: 'Chờ kiểm tra', color: 'bg-orange-100 text-orange-700 border-orange-200' },
      RETURNED: { label: 'Đã trả', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700 border-red-200' },
      CANCELED: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-700 border-slate-200' },
      OVERDUE: { label: 'Quá hạn', color: 'bg-rose-100 text-rose-700 border-rose-200 font-bold' }
    };
    const s = map[status] || { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    return <span className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border ${s.color}`}>{s.label}</span>;
  };

  const filtered = loans.filter(l => 
    l.loan_code.toLowerCase().includes(search.toLowerCase()) || 
    (l.student_name && l.student_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Đơn mượn</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-500" /> Theo dõi, xét duyệt và quản lý toàn bộ đơn mượn
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn hoặc người mượn..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm hover:border-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm w-full sm:w-auto justify-center">
            <Filter className="h-4 w-4" />
            <span>Lọc trạng thái</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[12px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Người mượn</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-28 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-36 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-32 rounded-md" /></td>
                    <td className="px-6 py-5 flex justify-end"><LoadingSkeleton className="h-8 w-20 rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <ClipboardList className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy đơn mượn</h3>
                      <p className="text-slate-500">Không có dữ liệu nào khớp với từ khóa tìm kiếm của bạn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(loan => (
                  <tr key={loan.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg text-[13px] border border-slate-200">
                        {loan.loan_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{loan.student_name}</td>
                    <td className="px-6 py-4">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(loan.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/loans/${loan.id}`} className="inline-flex items-center gap-1.5 text-blue-600 font-semibold bg-white border border-blue-200 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                        <FileText className="h-4 w-4" /> Chi tiết
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
