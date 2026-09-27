'use client';
import { useState, useEffect } from 'react';
import { Search, Eye, AlertCircle, CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type Scan = {
  scan_id: string;
  scan_time: string;
  image_url: string;
  ai_status: string;
  discrepancy_details: string;
  loan_id: string;
  loan_status: string;
  username: string;
  full_name: string;
  admin_decision: string | null;
};

export default function AIInspectionsPage() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'all'
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const loadData = async () => {
      try {
        const res = await fetch(`/api/admin/reviews?filter=${filter}`);
        const data = await res.json();
        if (data.success && !ignore) {
          setScans(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, [filter, refresh]);

  const handleReview = async (decision: string) => {
    if (!selectedScan) return;
    
    let promptMsg = '';
    if (decision === 'CONFIRM') promptMsg = 'Nhập ghi chú xác nhận (không bắt buộc):';
    if (decision === 'CORRECT') promptMsg = 'Nhập lý do AI nhận diện sai (Bắt buộc):';
    if (decision === 'REJECT') promptMsg = 'Nhập lý do bác bỏ hình ảnh này (Bắt buộc):';
    
    const reason = prompt(promptMsg);
    
    if (decision === 'CORRECT' && !reason) {
      alert('Phân loại lại (CORRECT) yêu cầu phải có lý do.');
      return;
    }
    if (decision === 'REJECT' && !reason) {
      alert('Bác bỏ (REJECT) yêu cầu phải có lý do.');
      return;
    }

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: selectedScan.scan_id, decision, reason })
      });
      if (res.ok) {
        alert('Cập nhật kết quả thành công!');
        setSelectedScan(null);
        setRefresh(r => r + 1);
      } else {
        alert('Lỗi cập nhật. Vui lòng thử lại.');
      }
    } catch (e) {
      alert('Lỗi mạng.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản trị Kết quả kiểm kê AI</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-500" /> Đánh giá và xác nhận các cảnh báo hư hỏng/thiếu linh kiện từ hệ thống AI
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* List Section */}
        <div className="w-full md:w-5/12 lg:w-1/3 flex flex-col border-r border-slate-100">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-2">
            <button 
              onClick={() => setFilter('pending')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-[13px] uppercase tracking-wide transition-all ${
                filter === 'pending' 
                  ? 'bg-white shadow-sm border border-slate-200 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Cần kiểm tra
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-[13px] uppercase tracking-wide transition-all ${
                filter === 'all' 
                  ? 'bg-white shadow-sm border border-slate-200 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-100 border border-transparent'
              }`}
            >
              Tất cả
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            {loading ? (
              <div className="p-4 space-y-4">
                <LoadingSkeleton className="h-20 w-full rounded-xl" />
                <LoadingSkeleton className="h-20 w-full rounded-xl" />
                <LoadingSkeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : scans.length === 0 ? (
              <div className="p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Không có kết quả nào</h3>
                  <p className="text-sm text-slate-500">Tất cả các bản ghi đã được xử lý xong.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {scans.map(scan => (
                  <div 
                    key={scan.scan_id} 
                    onClick={() => setSelectedScan(scan)}
                    className={`p-5 cursor-pointer transition-all border-l-4 ${
                      selectedScan?.scan_id === scan.scan_id 
                        ? 'bg-blue-50/50 border-blue-500' 
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="font-bold text-slate-800 text-[14px]">{scan.full_name}</div>
                      <div className="text-[12px] text-slate-400 font-medium">{new Date(scan.scan_time).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        scan.admin_decision ? 'bg-emerald-100 text-emerald-700' : 
                        scan.ai_status === 'DISCREPANCY' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {scan.admin_decision ? 'Đã xác nhận' : scan.ai_status === 'DISCREPANCY' ? 'Cảnh báo lỗi' : 'Bình thường'}
                      </span>
                      <span className="text-[12px] text-slate-500 font-mono truncate max-w-[150px]">{scan.loan_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Section */}
        <div className="w-full md:w-7/12 lg:w-2/3 bg-white flex flex-col relative">
          {selectedScan ? (
            <div className="p-8 h-full overflow-y-auto">
              <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                Chi tiết kết quả quét AI
              </h3>
              
              <div className="bg-slate-100/50 rounded-2xl h-[300px] w-full flex items-center justify-center mb-8 overflow-hidden border border-slate-200">
                {selectedScan.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={selectedScan.image_url} alt="Evidence" className="object-contain w-full h-full hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <Eye className="h-10 w-10 mb-3 opacity-30" />
                    <span className="font-medium">Không có ảnh bằng chứng</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">Kết luận từ AI</p>
                  <p className={`font-bold text-[15px] flex items-center gap-2 ${selectedScan.ai_status === 'DISCREPANCY' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedScan.ai_status === 'DISCREPANCY' ? (
                      <><AlertCircle className="w-4 h-4" /> Phát hiện sai lệch</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Khớp hoàn toàn</>
                    )}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">Mã Đơn mượn</p>
                  <p className="font-mono font-bold text-[15px] text-slate-700">
                    {selectedScan.loan_id}
                  </p>
                </div>
                
                {selectedScan.discrepancy_details && (
                  <div className="md:col-span-2 bg-rose-50/50 rounded-xl p-5 border border-rose-100">
                    <p className="text-[11px] text-rose-500 font-bold uppercase tracking-wider mb-2">Chi tiết phát hiện thiếu/hỏng</p>
                    <p className="text-[14px] text-rose-900 leading-relaxed font-medium">
                      {selectedScan.discrepancy_details}
                    </p>
                  </div>
                )}
              </div>

              {!selectedScan.admin_decision ? (
                <div className="space-y-4">
                  <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider mb-3">Quyết định của Quản trị viên</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleReview('CONFIRM')} 
                      className="flex flex-col items-center justify-center gap-2 bg-emerald-600 text-white p-4 rounded-xl hover:bg-emerald-700 transition-colors font-semibold shadow-sm hover:shadow-md active:scale-95"
                    >
                      <CheckCircle2 className="h-6 w-6" /> Xác nhận AI đúng
                    </button>
                    <button 
                      onClick={() => handleReview('CORRECT')} 
                      className="flex flex-col items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-sm hover:shadow-md active:scale-95"
                    >
                      <BrainCircuit className="h-6 w-6" /> Đính chính AI sai
                    </button>
                    <button 
                      onClick={() => handleReview('REJECT')} 
                      className="flex flex-col items-center justify-center gap-2 bg-white border-2 border-slate-200 text-slate-700 p-4 rounded-xl hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-colors font-semibold active:scale-95"
                    >
                      <XCircle className="h-6 w-6" /> Bác bỏ ảnh (Chụp lại)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-emerald-800">Bạn đã xử lý bản ghi này</h4>
                  <p className="text-[13px] text-emerald-600 mt-1">Quyết định: {selectedScan.admin_decision}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <BrainCircuit className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Chưa chọn bản ghi nào</h3>
              <p className="max-w-xs text-[14px]">Vui lòng chọn một bản ghi từ danh sách bên trái để xem hình ảnh và xác nhận kết quả kiểm kê.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
