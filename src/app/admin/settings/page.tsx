'use client';
import { useState, useEffect } from 'react';
import { Save, Settings, Clock, Bell, Shield, Database, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('loan');
  
  const [configs, setConfigs] = useState({
    // Quy định Mượn/Trả
    MAX_LOAN_DAYS: '7',
    OVERDUE_WARNING_HOURS: '24',
    AUTO_NOTIFICATIONS: 'true',
    
    // Sao lưu dữ liệu
    AUTO_BACKUP: 'true',
    BACKUP_FREQUENCY: 'daily',
    
    // Bảo mật
    REQUIRE_2FA: 'false',
    PASSWORD_EXPIRY_DAYS: '90',
    
    // Giao diện
    DEFAULT_THEME: 'light'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadConfigs() {
      try {
        const res = await fetch('/api/configs');
        const data = await res.json();
        if (data.success) {
          const map: Record<string, string> = {};
          data.data.forEach((c: { key: string, value: string }) => map[c.key] = c.value);
          setConfigs(prev => ({ ...prev, ...map }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadConfigs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setShowSuccess(false);

    try {
      const payload = Object.entries(configs).map(([key, value]) => ({ key, value }));
      const res = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('Lưu cấu hình thất bại.');
      }
    } catch (error: unknown) {
      alert('Đã có lỗi mạng xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 font-sans p-8">
        <LoadingSkeleton className="h-32 w-full rounded-2xl" />
        <div className="flex gap-8">
          <LoadingSkeleton className="h-96 w-1/4 rounded-2xl" />
          <LoadingSkeleton className="h-96 w-3/4 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-8 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-gradient-to-br from-slate-100 to-blue-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu hình hệ thống</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-500" /> Quản lý các tham số vận hành chung của hệ thống ACM
          </p>
        </div>
        <div className="relative z-10">
          <button 
            form="settings-form"
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md transition-all font-semibold active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</span>
            ) : (
              <><Save className="h-4 w-4" /> Lưu cấu hình</>
            )}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-bold">Lưu cấu hình hệ thống thành công!</span> Các thay đổi đã được áp dụng.
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menu Side */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 sticky top-6">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('loan')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'loan' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Clock className="w-5 h-5" /> Quy định Mượn/Trả
              </button>
              <button 
                onClick={() => setActiveTab('backup')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'backup' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Database className="w-5 h-5" /> Sao lưu dữ liệu
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Shield className="w-5 h-5" /> Bảo mật
              </button>
              <button 
                onClick={() => setActiveTab('ui')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'ui' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <LayoutDashboard className="w-5 h-5" /> Giao diện
              </button>
            </nav>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full lg:w-3/4">
          <form id="settings-form" onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            
            {/* LOAN TAB */}
            {activeTab === 'loan' && (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Quy định Mượn / Trả
                  </h2>
                </div>
                
                <div className="p-8 space-y-8 animate-in fade-in duration-300">
                  <div className="max-w-2xl">
                    <label className="block text-[14px] font-bold text-slate-800 mb-2">Thời gian mượn tối đa (ngày)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="number" min="1" max="90" required
                        className="w-32 bg-white border border-slate-300 p-3 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={configs.MAX_LOAN_DAYS}
                        onChange={e => setConfigs({...configs, MAX_LOAN_DAYS: e.target.value})}
                      />
                      <span className="text-slate-500 text-[14px]">ngày</span>
                    </div>
                    <p className="text-[13px] text-slate-500 mt-2">Giới hạn thời gian sinh viên có thể đăng ký mượn linh kiện hoặc bộ dụng cụ.</p>
                  </div>

                  <div className="max-w-2xl border-t border-slate-100 pt-8">
                    <label className="block text-[14px] font-bold text-slate-800 mb-2">Thời gian cảnh báo quá hạn (giờ)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="number" min="1" required
                        className="w-32 bg-white border border-slate-300 p-3 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={configs.OVERDUE_WARNING_HOURS}
                        onChange={e => setConfigs({...configs, OVERDUE_WARNING_HOURS: e.target.value})}
                      />
                      <span className="text-slate-500 text-[14px]">giờ</span>
                    </div>
                    <p className="text-[13px] text-slate-500 mt-2">Gửi thông báo nhắc nhở trước khi đơn mượn hết hạn.</p>
                  </div>

                  <div className="max-w-2xl border-t border-slate-100 pt-8">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" className="peer sr-only"
                          checked={configs.AUTO_NOTIFICATIONS === 'true'}
                          onChange={e => setConfigs({...configs, AUTO_NOTIFICATIONS: e.target.checked ? 'true' : 'false'})}
                        />
                        <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-6 shadow-sm"></div>
                      </div>
                      <div>
                        <span className="block text-[14px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Bật thông báo tự động (Auto-notifications)</span>
                        <p className="text-[13px] text-slate-500 mt-1">Hệ thống sẽ tự động gửi email/thông báo khi có thay đổi trạng thái đơn mượn.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* BACKUP TAB */}
            {activeTab === 'backup' && (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    Sao lưu dữ liệu
                  </h2>
                </div>
                
                <div className="p-8 space-y-8 animate-in fade-in duration-300">
                  <div className="max-w-2xl">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" className="peer sr-only"
                          checked={configs.AUTO_BACKUP === 'true'}
                          onChange={e => setConfigs({...configs, AUTO_BACKUP: e.target.checked ? 'true' : 'false'})}
                        />
                        <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-6 shadow-sm"></div>
                      </div>
                      <div>
                        <span className="block text-[14px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Bật sao lưu tự động (Auto Backup)</span>
                        <p className="text-[13px] text-slate-500 mt-1">Tự động kết xuất (dump) toàn bộ dữ liệu PostgreSQL sang tệp dự phòng.</p>
                      </div>
                    </label>
                  </div>

                  <div className="max-w-2xl border-t border-slate-100 pt-8">
                    <label className="block text-[14px] font-bold text-slate-800 mb-2">Chu kỳ sao lưu</label>
                    <select 
                      className="w-64 bg-white border border-slate-300 p-3 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={configs.BACKUP_FREQUENCY}
                      onChange={e => setConfigs({...configs, BACKUP_FREQUENCY: e.target.value})}
                    >
                      <option value="daily">Hàng ngày (Lúc 00:00)</option>
                      <option value="weekly">Hàng tuần (Chủ nhật)</option>
                      <option value="monthly">Hàng tháng (Ngày mùng 1)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Bảo mật
                  </h2>
                </div>
                
                <div className="p-8 space-y-8 animate-in fade-in duration-300">
                  <div className="max-w-2xl">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="checkbox" className="peer sr-only"
                          checked={configs.REQUIRE_2FA === 'true'}
                          onChange={e => setConfigs({...configs, REQUIRE_2FA: e.target.checked ? 'true' : 'false'})}
                        />
                        <div className="w-12 h-6 bg-slate-200 rounded-full peer-checked:bg-blue-600 transition-colors duration-300"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-6 shadow-sm"></div>
                      </div>
                      <div>
                        <span className="block text-[14px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Bắt buộc xác thực 2 bước (2FA)</span>
                        <p className="text-[13px] text-slate-500 mt-1">Yêu cầu tất cả Quản trị viên (Admin) phải xác minh qua mã OTP khi đăng nhập.</p>
                      </div>
                    </label>
                  </div>

                  <div className="max-w-2xl border-t border-slate-100 pt-8">
                    <label className="block text-[14px] font-bold text-slate-800 mb-2">Yêu cầu đổi mật khẩu sau (ngày)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="number" min="0" required
                        className="w-32 bg-white border border-slate-300 p-3 rounded-xl text-[15px] font-medium focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                        value={configs.PASSWORD_EXPIRY_DAYS}
                        onChange={e => setConfigs({...configs, PASSWORD_EXPIRY_DAYS: e.target.value})}
                      />
                      <span className="text-slate-500 text-[14px]">ngày</span>
                    </div>
                    <p className="text-[13px] text-slate-500 mt-2">Nhập 0 để vô hiệu hóa tính năng này.</p>
                  </div>
                </div>
              </>
            )}

            {/* UI TAB */}
            {activeTab === 'ui' && (
              <>
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-blue-500" />
                    Giao diện
                  </h2>
                </div>
                
                <div className="p-8 space-y-8 animate-in fade-in duration-300">
                  <div className="max-w-2xl">
                    <label className="block text-[14px] font-bold text-slate-800 mb-4">Giao diện mặc định (Default Theme)</label>
                    <div className="flex gap-4">
                      <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-3 ${configs.DEFAULT_THEME === 'light' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'}`}>
                        <input type="radio" name="theme" value="light" className="sr-only" checked={configs.DEFAULT_THEME === 'light'} onChange={() => setConfigs({...configs, DEFAULT_THEME: 'light'})} />
                        <div className="w-16 h-12 bg-white rounded shadow-sm border border-slate-200 flex flex-col p-1 gap-1">
                          <div className="w-full h-2 bg-slate-100 rounded-sm"></div>
                          <div className="w-full h-8 bg-slate-50 rounded-sm"></div>
                        </div>
                        <span className="font-semibold text-sm text-slate-700">Sáng (Light)</span>
                      </label>
                      <label className={`flex-1 border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center gap-3 ${configs.DEFAULT_THEME === 'dark' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'}`}>
                        <input type="radio" name="theme" value="dark" className="sr-only" checked={configs.DEFAULT_THEME === 'dark'} onChange={() => setConfigs({...configs, DEFAULT_THEME: 'dark'})} />
                        <div className="w-16 h-12 bg-slate-800 rounded shadow-sm border border-slate-700 flex flex-col p-1 gap-1">
                          <div className="w-full h-2 bg-slate-700 rounded-sm"></div>
                          <div className="w-full h-8 bg-slate-900 rounded-sm"></div>
                        </div>
                        <span className="font-semibold text-sm text-slate-700">Tối (Dark)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div className="bg-blue-50 p-5 border-t border-blue-100 flex gap-4 items-start mx-8 mb-8 rounded-xl mt-4">
              <Bell className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Cập nhật hệ thống</h4>
                <p className="text-[13px] text-blue-800 mt-1">Việc thay đổi cấu hình sẽ được lưu vào cơ sở dữ liệu và có hiệu lực ngay lập tức đối với toàn bộ hệ thống.</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
