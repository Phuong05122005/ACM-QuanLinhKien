'use client';

import { useState, useEffect } from 'react';
import { Search, ShieldAlert, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import clsx from 'clsx';

type Dispute = {
  id: string;
  loan_id: string;
  loan_code?: string;
  reason: string;
  status: string;
  created_at: string;
};

type Loan = {
  id: string;
  loan_code: string;
};

export default function StudentDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newDispute, setNewDispute] = useState({ loan_id: '', reason: '' });
  const [error, setError] = useState('');

  const fetchDisputes = () => {
    fetch('/api/disputes')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDisputes(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
    // Fetch loans for the dropdown
    fetch('/api/loans')
      .then(res => res.json())
      .then(data => {
        if (data.success) setLoans(data.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDispute.loan_id || !newDispute.reason) {
      setError('Vui lòng chọn đơn mượn và nhập lý do khiếu nại.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDispute)
      });
      const data = await res.json();
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewDispute({ loan_id: '', reason: '' });
        setLoading(true);
        fetchDisputes(); // Refresh list
      } else {
        setError(data.error?.message || 'Không thể tạo khiếu nại');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Khiếu nại của tôi</h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2 text-indigo-500" />
            Gửi và theo dõi trạng thái khiếu nại về kết quả kiểm kê hoặc trả linh kiện
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          Tạo khiếu nại mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-5 border-b border-slate-200">Mã đơn mượn</th>
                <th className="px-6 py-5 border-b border-slate-200">Lý do khiếu nại</th>
                <th className="px-6 py-5 border-b border-slate-200">Trạng thái</th>
                <th className="px-6 py-5 border-b border-slate-200 text-right">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4}><LoadingSkeleton className="h-20 w-full" /></td></tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16">
                    <EmptyState 
                      icon={<ShieldAlert className="w-12 h-12 text-slate-300" />}
                      title="Chưa có khiếu nại nào" 
                      description="Bạn chưa tạo bất kỳ khiếu nại nào trên hệ thống." 
                    />
                  </td>
                </tr>
              ) : (
                disputes.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                        {d.loan_code || d.loan_id.substring(0,8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="truncate text-slate-700">{d.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                        d.status === 'PENDING_REVIEW' && "bg-amber-100 text-amber-700 border border-amber-200",
                        d.status === 'RESOLVED' && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                        d.status === 'REJECTED' && "bg-rose-100 text-rose-700 border border-rose-200"
                      )}>
                        {d.status === 'PENDING_REVIEW' ? 'Đang xử lý' : d.status === 'RESOLVED' ? 'Đã giải quyết' : d.status === 'REJECTED' ? 'Từ chối' : d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-slate-500">
                      {new Date(d.created_at).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Tạo khiếu nại mới</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium flex items-start gap-3 border border-rose-100">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Đơn mượn liên quan</label>
                <select 
                  value={newDispute.loan_id}
                  onChange={e => setNewDispute({...newDispute, loan_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                >
                  <option value="">-- Chọn một đơn mượn --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id}>{l.loan_code}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Chỉ có thể khiếu nại các đơn mượn của bạn.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Lý do khiếu nại</label>
                <textarea 
                  value={newDispute.reason}
                  onChange={e => setNewDispute({...newDispute, reason: e.target.value})}
                  rows={4}
                  placeholder="Ví dụ: AI báo thiếu linh kiện ESP32 nhưng tôi đã trả đầy đủ..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Gửi khiếu nại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
