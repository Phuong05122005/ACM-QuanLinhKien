'use client';
import { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, ShieldCheck, Filter, FileText, CheckCircle, XCircle } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type Dispute = {
  id: string;
  loan_id: string;
  description: string;
  status: string;
  created_at: string;
  username?: string;
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [reviewStatus, setReviewStatus] = useState('REVIEWING');
  const [resolution, setResolution] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDisputes = () => {
    fetch('/api/disputes')
      .then(res => res.json())
      .then(data => {
        if (data.success) setDisputes(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/disputes/${selectedDispute.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewStatus, resolution })
      });
      if (res.ok) {
        setSelectedDispute(null);
        setResolution('');
        fetchDisputes();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Lỗi khi cập nhật khiếu nại');
      }
    } catch (e) {
      alert('Đã xảy ra lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = disputes.filter(d => 
    d.loan_id.includes(search) || 
    (d.username && d.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản trị Khiếu nại</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Xử lý khiếu nại của sinh viên về quá trình mượn/trả
          </p>
        </div>
      </div>

      {/* Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Chi tiết khiếu nại</h3>
              </div>
              <button 
                onClick={() => setSelectedDispute(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 text-[14px] text-slate-700 bg-slate-50/80 border border-slate-100 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Người khiếu nại:</span>
                  <span className="font-bold text-slate-900">{selectedDispute.username}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500 font-medium">Trạng thái hiện tại:</span>
                  <span className="font-bold text-blue-600">{selectedDispute.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Nội dung khiếu nại:</span>
                  <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 italic">&quot;{selectedDispute.description}&quot;</p>
                </div>
              </div>
              
              <form onSubmit={handleReview} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Cập nhật trạng thái</label>
                  <select 
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                    value={reviewStatus} 
                    onChange={e => setReviewStatus(e.target.value)}
                  >
                    <option value="REVIEWING">Đang xem xét (Reviewing)</option>
                    <option value="RESOLVED">Giải quyết xong (Resolved)</option>
                    <option value="REJECTED">Từ chối (Rejected)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Ghi chú / Hướng giải quyết</label>
                  <textarea 
                    required={['RESOLVED', 'REJECTED'].includes(reviewStatus)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                    rows={3} 
                    value={resolution} 
                    onChange={e => setResolution(e.target.value)}
                    placeholder="Ghi rõ lý do quyết định của bạn..."
                  ></textarea>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Đang xử lý...' : 'Xác nhận cập nhật'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn hoặc người mượn..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-amber-500/15 focus:border-amber-500 transition-all shadow-sm hover:border-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-50 hover:text-amber-600 transition-colors shadow-sm w-full sm:w-auto justify-center">
            <Filter className="h-4 w-4" />
            <span>Lọc trạng thái</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[12px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Mã đơn (Loan ID)</th>
                <th className="px-6 py-4">Sinh viên</th>
                <th className="px-6 py-4">Lý do khiếu nại</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-28 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-32 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-48 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-24 rounded-md" /></td>
                    <td className="px-6 py-5 flex justify-end"><LoadingSkeleton className="h-8 w-20 rounded-lg" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Không có khiếu nại nào</h3>
                      <p className="text-slate-500">Mọi thứ đang hoạt động trơn tru. Không có dữ liệu khiếu nại.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg text-[13px] border border-slate-200">
                        {d.loan_id.substring(0,8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{d.username}</td>
                    <td className="px-6 py-4 max-w-[200px] lg:max-w-xs truncate text-slate-500" title={d.description}>
                      {d.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border ${
                        d.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        d.status === 'REVIEWING' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        d.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        d.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {d.status === 'PENDING' ? 'Chờ xử lý' :
                         d.status === 'REVIEWING' ? 'Đang xem xét' :
                         d.status === 'RESOLVED' ? 'Đã giải quyết' :
                         d.status === 'REJECTED' ? 'Từ chối' : d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(d.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { 
                          setSelectedDispute(d); 
                          setReviewStatus(d.status === 'PENDING' ? 'REVIEWING' : d.status); 
                          setResolution(''); 
                        }} 
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold bg-white border border-blue-200 hover:bg-blue-600 hover:text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                      >
                        <FileText className="h-4 w-4" /> Chi tiết
                      </button>
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
