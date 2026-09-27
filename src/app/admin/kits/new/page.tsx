'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Box, Save, CheckCircle } from 'lucide-react';

export default function NewKitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'AVAILABLE'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Lỗi khi tạo bộ dụng cụ');
      } else {
        router.push(`/admin/kits/${data.data.id}/composition`);
        router.refresh();
      }
    } catch (error: unknown) {
      setError('Đã xảy ra lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans pb-12">
      <Link href="/admin/kits" className="inline-flex items-center gap-2 text-slate-500 hover:text-fuchsia-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Kits
      </Link>
      
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-fuchsia-600 to-pink-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30">
              <Box className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Thêm Bộ dụng cụ (Kit)</h1>
              <p className="text-fuchsia-100 mt-1">Tạo mới bộ công cụ gồm nhiều linh kiện kết hợp.</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}
          
          <div className="max-w-3xl mx-auto space-y-6">
            <form id="kit-form" onSubmit={handleSubmit} className="space-y-6 bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Tên bộ Kit <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all shadow-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="VD: Bộ Arduino Cơ Bản"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Mã định danh (Khóa học - Chủ đề) <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all shadow-sm font-mono uppercase"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="VD: FZ - CĐ1"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Trạng thái khởi tạo <span className="text-rose-500">*</span></label>
                  <select 
                    required
                    className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all shadow-sm appearance-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="AVAILABLE">Sẵn sàng mượn (AVAILABLE)</option>
                    <option value="INACTIVE">Ngừng hoạt động (INACTIVE)</option>
                    <option value="MAINTENANCE">Đang bảo trì (MAINTENANCE)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Mô tả (Không bắt buộc)</label>
                <textarea 
                  className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-fuchsia-500/20 focus:border-fuchsia-500 transition-all shadow-sm"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Bộ kit dành cho môn Thực hành vi điều khiển..."
                />
              </div>
            </form>
          </div>
          
          <div className="mt-10 border-t border-slate-100 pt-8 flex justify-end max-w-3xl mx-auto">
            <button 
              form="kit-form"
              type="submit" 
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-fuchsia-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-fuchsia-700 hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all active:scale-[0.98] disabled:opacity-70 w-full sm:w-auto"
            >
              {submitting ? 'Đang lưu...' : (
                <>
                  <CheckCircle className="w-5 h-5" /> Tạo Kit & Thêm linh kiện con
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
