'use client';
import { useState } from 'react';
import { Bell, Megaphone, Send, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function NotificationsAdminPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }
    
    if (!confirm('Bạn sắp gửi thông báo này tới TẤT CẢ người dùng trong hệ thống. Bạn có chắc chắn không?')) return;

    setSending(true);
    setSuccessCount(null);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessCount(data.data.sent_count);
        setTitle('');
        setMessage('');
      } else {
        alert(data.error?.message || 'Không thể gửi thông báo.');
      }
    } catch (error: unknown) {
      alert('Đã xảy ra lỗi hệ thống.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-8 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thông báo hệ thống</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-500" /> Gửi thông báo đến toàn bộ sinh viên và giảng viên
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/20 border border-slate-100 overflow-hidden">
        <div className="p-8">
          {successCount !== null && (
            <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-800 text-lg">Gửi thành công!</h3>
                <p className="text-emerald-700 mt-1">Thông báo đã được gửi tới <strong className="text-emerald-900">{successCount}</strong> người dùng đang hoạt động trong hệ thống.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-10">
            {/* Form */}
            <div className="w-full md:w-2/3">
              <form onSubmit={handleBroadcast} className="space-y-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Tiêu đề thông báo <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[15px] font-medium focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Nghỉ lễ Quốc khánh 2/9..."
                    maxLength={100}
                  />
                  <div className="text-right text-[12px] text-slate-400 mt-1">{title.length}/100</div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Nội dung chi tiết <span className="text-rose-500">*</span></label>
                  <textarea 
                    required
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[15px] focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Nhập nội dung chi tiết bạn muốn truyền tải..."
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={sending || !title.trim() || !message.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang phát...
                      </span>
                    ) : (
                      <><Send className="w-4 h-4" /> Phát thông báo toàn hệ thống</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar info */}
            <div className="w-full md:w-1/3 space-y-6">
              <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-[15px]">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Lưu ý quan trọng
                </h4>
                <ul className="space-y-3 text-[13px] text-blue-800/80">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>Thông báo sẽ hiển thị ngay lập tức trên quả chuông của <strong>tất cả sinh viên và giảng viên</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>Hành động này <strong>không thể hoàn tác</strong> hay thu hồi sau khi gửi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                    <span>Chỉ nên dùng cho các thông báo khẩn cấp, nghỉ lễ, hoặc bảo trì kho.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                  <Users className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đối tượng nhận</div>
                  <div className="font-bold text-slate-800 text-[14px]">Tất cả User đang hoạt động</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
