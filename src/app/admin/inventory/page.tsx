'use client';
import React, { useState, useEffect } from 'react';
import { Search, History, ArrowDownRight, ArrowUpRight, Plus, X, Package, FileText } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type InventoryTransaction = {
  id: string;
  component_id: string;
  component_name: string;
  component_identifier: string;
  quantity_change: number;
  transaction_type: string;
  reference_id: string;
  created_at: string;
};

type ComponentItem = {
  id: string;
  name: string;
  identifier: string;
};

export default function InventoryHistoryPage() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    component_id: '',
    transaction_type: 'STOCK_IN',
    quantity_change: 1,
    reference_id: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = () => {
    setLoading(true);
    fetch(`/api/inventory?limit=50&search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTransactions(data.data.items || data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
    
    // Fetch components for dropdown
    fetch('/api/components?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.success) setComponents(data.data.items || data.data);
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const isDecrease = ['STOCK_OUT', 'BORROW', 'DAMAGE', 'MISSING'].includes(formData.transaction_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        quantity_change: isDecrease ? -Math.abs(formData.quantity_change) : Math.abs(formData.quantity_change)
      };

      const res = await fetch('/api/inventory/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setFormError(data.error?.message || 'Giao dịch thất bại');
      } else {
        setShowModal(false);
        setFormData({ ...formData, quantity_change: 1, reference_id: '' });
        fetchTransactions(); // reload list
      }
    } catch (error: unknown) {
      setFormError('Đã xảy ra lỗi hệ thống');
    } finally {
      setSubmitting(false);
    }
  };

  const getTransactionBadge = (type: string, qty: number) => {
    const isPositive = qty > 0;
    
    const labelMap: Record<string, string> = {
      'STOCK_IN': 'Nhập kho',
      'STOCK_OUT': 'Xuất kho',
      'ADJUSTMENT': 'Điều chỉnh',
      'DAMAGE': 'Hư hỏng',
      'MISSING': 'Thất lạc',
      'MANUAL_OVERRIDE': 'Ghi đè thủ công',
      'RETURN': 'Trả lại'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-semibold border ${
        isPositive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'
      }`}>
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {labelMap[type] || type}
      </span>
    );
  };

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lịch sử Kho</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" /> Theo dõi mọi biến động nhập/xuất linh kiện
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 transition-all font-semibold active:scale-[0.98] w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" /> 
            <span>Giao dịch mới</span>
          </button>
        </div>
      </div>

      {/* Modal Transaction Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Tạo Giao Dịch Kho</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {formError}
                </div>
              )}
              
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Linh kiện <span className="text-rose-500">*</span></label>
                <select 
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                  value={formData.component_id} 
                  onChange={e => setFormData({...formData, component_id: e.target.value})}
                >
                  <option value="" disabled>-- Chọn linh kiện --</option>
                  {components.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.identifier})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Loại giao dịch <span className="text-rose-500">*</span></label>
                <select 
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                  value={formData.transaction_type}
                  onChange={e => setFormData({...formData, transaction_type: e.target.value})}
                >
                  <option value="STOCK_IN">Nhập kho (STOCK_IN)</option>
                  <option value="STOCK_OUT">Xuất kho (STOCK_OUT)</option>
                  <option value="ADJUSTMENT">Điều chỉnh (ADJUSTMENT)</option>
                  <option value="DAMAGE">Báo hỏng (DAMAGE)</option>
                  <option value="MISSING">Thất lạc (MISSING)</option>
                  <option value="MANUAL_OVERRIDE">Ghi đè thủ công (MANUAL_OVERRIDE)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Số lượng <span className="text-rose-500">*</span></label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                  value={formData.quantity_change}
                  onChange={e => setFormData({...formData, quantity_change: parseInt(e.target.value) || 1})}
                />
                <p className={`text-[13px] mt-1.5 font-medium ${isDecrease ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {isDecrease ? `Giao dịch này sẽ TRỪ đi số lượng trong kho.` : `Giao dịch này sẽ CỘNG thêm vào kho.`}
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Ghi chú (Tùy chọn)</label>
                <input 
                  type="text" 
                  placeholder="Mã phiếu nhập, lý do..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                  value={formData.reference_id}
                  onChange={e => setFormData({...formData, reference_id: e.target.value})}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70"
                >
                  {submitting ? 'Đang xử lý...' : 'Xác nhận giao dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm theo tên linh kiện hoặc mã..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-indigo-500/15 focus:border-indigo-500 transition-all shadow-sm hover:border-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[12px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Linh kiện</th>
                <th className="px-6 py-4">Loại giao dịch</th>
                <th className="px-6 py-4 text-right">Biến động</th>
                <th className="px-6 py-4">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-32 rounded-md" /></td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <LoadingSkeleton className="h-5 w-40 rounded-md" />
                        <LoadingSkeleton className="h-4 w-24 rounded-md" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-5 flex justify-end"><LoadingSkeleton className="h-5 w-12 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-32 rounded-md" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <History className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Chưa có giao dịch nào</h3>
                      <p className="text-slate-500">Chưa có biến động kho nào được ghi nhận cho linh kiện này.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map(t => (
                  <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(t.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-[15px]">{t.component_name}</div>
                      <div className="text-[13px] font-mono text-slate-500 mt-1">{t.component_identifier}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getTransactionBadge(t.transaction_type, t.quantity_change)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-[15px] ${t.quantity_change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.quantity_change > 0 ? '+' : ''}{t.quantity_change}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {t.reference_id ? (
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" /> {t.reference_id}
                        </span>
                      ) : '-'}
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
