'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Package, Save, Image as ImageIcon } from 'lucide-react';

export default function NewComponentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    category_id: '',
    total_quantity: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success) setCategories(d.data);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      let image_url = null;
      if (imageFile) {
        const imgData = new FormData();
        imgData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imgData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || 'Lỗi tải ảnh');
        image_url = uploadData.data.url;
      }

      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image_url })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Lỗi khi tạo linh kiện');
      } else {
        router.push(`/admin/components`);
        router.refresh();
      }
    } catch (error: unknown) {
      const err = error as Error;
      setError(err.message || 'Đã xảy ra lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-12">
      <Link href="/admin/components" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md">
        <ArrowLeft className="w-4 h-4" /> Quay lại kho
      </Link>
      
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Thêm mới linh kiện</h1>
              <p className="text-blue-100 mt-1">Nhập thông tin chi tiết và hình ảnh cho linh kiện mới</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-8 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Cột trái: Hình ảnh */}
            <div className="md:col-span-4 space-y-4">
              <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wide">Hình ảnh linh kiện</label>
              <div className="relative group">
                <div className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${imagePreview ? 'border-blue-300 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                  {imagePreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 p-6 text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                      <span className="text-sm font-medium">Bấm để tải ảnh lên</span>
                      <span className="text-xs mt-1">JPG, PNG (Tối đa 5MB)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl pointer-events-none">
                    <span className="text-white font-medium flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Đổi ảnh
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Tên linh kiện <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="VD: Arduino Uno R3"
                    className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Mã linh kiện (SKU/Code) <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="VD: ARD-001"
                      className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-mono"
                      value={formData.identifier}
                      onChange={e => setFormData({...formData, identifier: e.target.value.toUpperCase()})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Danh mục <span className="text-rose-500">*</span></label>
                    <select 
                      required
                      className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm appearance-none"
                      value={formData.category_id}
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      <option value="" disabled>-- Chọn một danh mục --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">Số lượng nhập ban đầu <span className="text-rose-500">*</span></label>
                  <input 
                    type="number" 
                    min="0"
                    required
                    className="w-full bg-white border border-slate-200 p-3.5 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={formData.total_quantity}
                    onChange={e => setFormData({...formData, total_quantity: parseInt(e.target.value) || 0})}
                  />
                  <p className="text-xs text-slate-500 mt-2">Số lượng này sẽ được ghi nhận là kho sẵn có ngay sau khi tạo.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {submitting ? 'Đang lưu...' : (
                    <>
                      <Save className="w-5 h-5" /> Hoàn tất tạo linh kiện
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
