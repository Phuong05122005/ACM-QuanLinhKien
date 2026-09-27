'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Search, Plus, Trash2, Calendar, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type Component = { id: string; name: string; available_quantity: number; identifier: string };

export default function NewLoanPage() {
  const router = useRouter();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [cart, setCart] = useState<{ id: string, name: string, qty: number, max: number }[]>([]);
  const [returnDate, setReturnDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setLoading(true));
    fetch('/api/components?limit=100')
      .then(r => r.json())
      .then(compData => {
        if (compData.success) setComponents(compData.data.items || compData.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (comp: Component) => {
    if (cart.length >= 5 && !cart.find(c => c.id === comp.id)) {
      setError('Bạn chỉ được mượn tối đa 5 loại linh kiện khác nhau.');
      return;
    }
    setError('');
    
    setCart(prev => {
      const existing = prev.find(c => c.id === comp.id);
      if (existing) {
        if (existing.qty >= comp.available_quantity) return prev;
        return prev.map(c => c.id === comp.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id: comp.id, name: comp.name, qty: 1, max: comp.available_quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  const updateCartQty = (id: string, qty: number) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c;
      const validQty = Math.max(1, Math.min(qty, c.max));
      return { ...c, qty: validQty };
    }));
  };

  const filteredComponents = components.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.identifier?.toLowerCase().includes(search.toLowerCase())
  );

  const submitLoan = async () => {
    setError('');
    if (cart.length === 0) return setError('Giỏ hàng trống');
    setSubmitting(true);
    
    const items = cart.map(c => ({
      component_id: c.id,
      quantity: c.qty
    }));

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          due_date: new Date(returnDate).toISOString(),
          items
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Đăng ký mượn thất bại.');
        setSubmitting(false);
      } else {
        setStep(3); // Success
      }
    } catch (error: unknown) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Đăng ký thành công!</h1>
        <p className="text-slate-600 mb-8">Đơn mượn của bạn đã được gửi và đang chờ duyệt. Mã QR sẽ được cấp sau khi quản trị viên phê duyệt đơn mượn.</p>
        <button 
          onClick={() => router.push('/loans')}
          className="bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Xem Đơn mượn của tôi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đăng ký mượn linh kiện</h1>
        <p className="text-sm text-slate-500 mt-1">Chọn tối đa 5 loại linh kiện và hạn trả để tạo đơn mượn mới.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4 text-sm font-medium mb-8 bg-white p-4 rounded-xl border border-slate-200">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>1</div>
          <span>Chọn linh kiện</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>2</div>
          <span>Xác nhận thông tin</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm linh kiện..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-4 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="space-y-3">
                    <LoadingSkeleton className="h-16 w-full" />
                    <LoadingSkeleton className="h-16 w-full" />
                  </div>
                ) : filteredComponents.length === 0 ? (
                  <EmptyState title="Không tìm thấy linh kiện" description="Không có linh kiện nào khả dụng." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredComponents.map(comp => {
                      const isAvail = comp.available_quantity > 0;
                      return (
                        <div key={comp.id} className="border border-slate-200 p-4 rounded-lg flex flex-col hover:border-blue-300 transition-colors bg-slate-50/50">
                          <h3 className="font-bold text-slate-900 mb-1">{comp.name}</h3>
                          <div className="flex justify-between items-end mt-auto">
                            <span className={`text-sm font-medium ${isAvail ? 'text-green-600' : 'text-red-500'}`}>
                              {isAvail ? `Còn ${comp.available_quantity} cái` : 'Tạm thời hết hàng'}
                            </span>
                            <button 
                              disabled={!isAvail}
                              onClick={() => addToCart(comp)}
                              className="bg-white border border-slate-300 text-slate-700 p-1.5 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
                              title="Thêm vào giỏ"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">Xác nhận thông tin mượn</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hạn trả linh kiện (Ngày)</label>
                <div className="relative max-w-sm">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={returnDate}
                    onChange={e => setReturnDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Hạn trả không được vượt quá 7 ngày kể từ ngày tạo đơn (tuân theo cấu hình hệ thống).</p>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6 flex flex-col h-full max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" /> Danh sách mượn
              </h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{cart.length}/5</span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">Chưa có linh kiện nào được chọn.</p>
              ) : (
                <ul className="space-y-4">
                  {cart.map(c => (
                    <li key={c.id} className="flex justify-between items-start gap-2 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm text-slate-900 block truncate" title={c.name}>{c.name}</span>
                        {step === 1 && (
                          <div className="flex items-center gap-2 mt-2">
                            <input 
                              type="number" 
                              min="1" max={c.max} 
                              value={c.qty}
                              onChange={(e) => updateCartQty(c.id, parseInt(e.target.value) || 1)}
                              className="w-16 p-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-500">/ {c.max}</span>
                          </div>
                        )}
                        {step === 2 && (
                          <span className="text-sm text-slate-600 mt-1 inline-block">Số lượng: <strong>{c.qty}</strong></span>
                        )}
                      </div>
                      {step === 1 && (
                        <button onClick={() => removeFromCart(c.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              {step === 1 ? (
                <button 
                  onClick={() => setStep(2)}
                  disabled={cart.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Tiếp tục
                </button>
              ) : (
                <>
                  <button 
                    onClick={submitLoan}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-medium py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70 shadow-sm"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Xác nhận Đăng ký
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-300 font-medium py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Quay lại
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
