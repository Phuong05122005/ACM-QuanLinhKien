'use client';
import { useState } from 'react';
import { AlertTriangle, ShieldAlert, Loader2, KeyRound, AlertOctagon, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function EmergencyPage() {
  const [operation, setOperation] = useState('FORCE_RETURN');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSubmit = async () => {
    setIsConfirmOpen(false);
    setLoading(true);
    setResult('');
    setError('');

    try {
      const res = await fetch('/api/admin/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation,
          loan_id: operation === 'FORCE_RETURN' ? targetId : undefined,
          component_id: operation === 'SYNC_INVENTORY' ? targetId : undefined,
          reason
        })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data.data.message || 'Thao tác thành công.');
        setTargetId('');
        setReason('');
      } else {
        setError(data.error?.message || 'Thao tác thất bại.');
      }
    } catch (e) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-8 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" /> Vận hành khẩn cấp (Emergency)
          </h1>
          <p className="text-[15px] text-slate-400 mt-1.5 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-500" /> Khu vực dành riêng cho Quản trị viên cấp cao (SUPER_ADMIN).
          </p>
        </div>
      </div>

      <div className="bg-rose-50/50 border border-rose-200 p-6 rounded-2xl flex items-start gap-4">
        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
          <AlertOctagon className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h3 className="font-bold text-rose-900 text-[16px]">CẢNH BÁO NGUY HIỂM</h3>
          <p className="text-rose-800/80 mt-1.5 text-[14px] leading-relaxed">
            Thao tác tại đây sẽ <strong>bỏ qua toàn bộ các quy trình kiểm tra thông thường</strong> của hệ thống (AI Review, Kiểu kê...). 
            Chức năng này chỉ được sử dụng trong trường hợp lỗi hệ thống nghiêm trọng hoặc bế tắc quy trình. Mọi thao tác đều được hệ thống ghi log kiểm toán (Audit Logs) vĩnh viễn không thể xóa.
          </p>
        </div>
      </div>

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
          <span className="font-bold">Thành công:</span> {result}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <span className="font-bold">Lỗi:</span> {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/20 border border-rose-100 overflow-hidden relative">
        {/* Top red danger bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 to-red-500"></div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Loại thao tác <span className="text-rose-500">*</span></label>
              <div className="relative">
                <select 
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[15px] font-medium focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm appearance-none cursor-pointer"
                  value={operation}
                  onChange={e => setOperation(e.target.value)}
                >
                  <option value="FORCE_RETURN">Ép trả đơn mượn (Bỏ qua AI & Kiểm kê)</option>
                  <option value="SYNC_INVENTORY">Đồng bộ kho linh kiện thủ công</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">
                {operation === 'FORCE_RETURN' ? 'Mã đơn mượn (Loan ID)' : 'Mã linh kiện (Component ID)'} <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-mono text-[14px] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm placeholder:font-sans"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                placeholder="Nhập chuỗi UUID chính xác..."
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Lý do vận hành khẩn cấp <span className="text-rose-500">*</span></label>
            <textarea 
              required
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[15px] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm resize-none"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Giải trình lý do bạn buộc phải can thiệp (ghi đè) hệ thống. Yêu cầu ít nhất 10 ký tự..."
            />
            <div className="flex justify-between mt-2">
              <span className="text-[12px] text-slate-400">Nội dung này sẽ được lưu vào Audit Logs</span>
              <span className={`text-[12px] ${reason.length < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {reason.length}/10 ký tự
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-end">
          <button 
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={loading || !targetId || reason.length < 10}
            className="flex items-center gap-2 bg-rose-600 text-white px-8 py-3 rounded-xl hover:bg-rose-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-lg hover:shadow-rose-500/30 active:scale-[0.98] disabled:active:scale-100"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
            <span>Thực thi lệnh ngay</span>
          </button>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="CẢNH BÁO: BẠN ĐANG THỰC THI LỆNH KHẨN CẤP"
        description="Hành động này mang tính phá hủy luồng thông thường và sẽ được lưu vĩnh viễn vào Nhật ký hệ thống (Audit Log). Bạn có chắc chắn muốn tiếp tục và chịu trách nhiệm cho thao tác này?"
        confirmText="TÔI XÁC NHẬN"
        cancelText="Hủy bỏ"
        onConfirm={handleSubmit}
        onCancel={() => setIsConfirmOpen(false)}
        variant="danger"
      />
    </div>
  );
}
