'use client';
import { useState, useEffect } from 'react';
import { Search, FileText } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import Link from 'next/link';

type Loan = {
  id: string;
  loan_code: string;
  status: string;
  created_at: string;
};

export default function StudentLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

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
      PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700' },
      APPROVED: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700' },
      READY_FOR_PICKUP: { label: 'Chờ nhận', color: 'bg-indigo-100 text-indigo-700' },
      BORROWED: { label: 'Đang mượn', color: 'bg-purple-100 text-purple-700' },
      RETURN_REQUIRES_INSPECTION: { label: 'Chờ kiểm tra', color: 'bg-orange-100 text-orange-700' },
      RETURNED: { label: 'Đã trả', color: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
      CANCELED: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-700' },
      OVERDUE: { label: 'Quá hạn', color: 'bg-red-100 text-red-700 font-bold' }
    };
    const s = map[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đơn mượn của tôi</h1>
        <p className="text-sm text-slate-500 mt-1">Lịch sử và trạng thái các đơn đăng ký mượn linh kiện</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><LoadingSkeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><LoadingSkeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><LoadingSkeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><LoadingSkeleton className="h-4 w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12">
                    <EmptyState title="Bạn chưa có đơn mượn nào" description="Bạn có thể tạo đơn mượn mới từ trang chủ." />
                  </td>
                </tr>
              ) : (
                loans.map(loan => (
                  <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{loan.loan_code}</td>
                    <td className="px-6 py-4">{getStatusBadge(loan.status)}</td>
                    <td className="px-6 py-4">{new Date(loan.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/loans/${loan.id}/pickup`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        <FileText className="h-4 w-4" /> Mã QR / Nhận trả
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
