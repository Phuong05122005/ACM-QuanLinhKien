'use client';
import { useState, useEffect } from 'react';
import { QrCode, Search, Plus, X, ShieldCheck, Box, Package, Printer } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import QRCodeReact from 'react-qr-code';

type QRCodeData = {
  id: string;
  code: string;
  entity_type: string;
  entity_id: string;
};

type SelectItem = {
  id: string;
  name: string;
  identifier?: string;
  code?: string;
};

export default function QRAdminPage() {
  const [qrs, setQrs] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const [targetType, setTargetType] = useState('COMPONENT');
  const [targetId, setTargetId] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const [components, setComponents] = useState<SelectItem[]>([]);
  const [kits, setKits] = useState<SelectItem[]>([]);

  const fetchQRs = () => {
    setLoading(true);
    fetch('/api/qr')
      .then(res => res.json())
      .then(data => {
        if (data.success) setQrs(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQRs();
    
    // Fetch components and kits for dropdowns
    fetch('/api/components?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.success) setComponents(data.data.items || data.data);
      })
      .catch(console.error);
      
    fetch('/api/kits')
      .then(res => res.json())
      .then(data => {
        if (data.success) setKits(data.data);
      })
      .catch(console.error);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) {
      alert('Vui lòng chọn tài sản!');
      return;
    }
    
    setGenerating(true);
    try {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId })
      });
      if (res.ok) {
        setShowModal(false);
        setTargetId('');
        fetchQRs();
      } else {
        const err = await res.json();
        alert(err.error?.message || 'Không thể tạo mã QR');
      }
    } catch (error: unknown) {
      alert('Đã xảy ra lỗi hệ thống');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintQR = (code: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>In mã QR - ${code}</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; text-align: center; font-family: system-ui, -apple-system, sans-serif; }
              .qr-container { width: 300px; height: 300px; margin-bottom: 20px; }
              .code-text { font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 0; }
              .title-text { font-size: 16px; color: #666; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 1px; }
            </style>
          </head>
          <body>
            <div class="title-text">QUÉT ĐỂ MƯỢN/TRẢ</div>
            <div class="qr-container" id="qr-mount"></div>
            <p class="code-text">${code}</p>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            <script>
              new QRCode(document.getElementById("qr-mount"), {
                text: "${code}",
                width: 300,
                height: 300,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
              });
              setTimeout(function() {
                window.print();
                window.close();
              }, 800);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredQRs = qrs.filter(qr => 
    qr.code.toLowerCase().includes(search.toLowerCase()) || 
    qr.entity_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR & Thiết bị</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Quản lý và khởi tạo mã vạch cho hệ thống AI
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/20 transition-all font-semibold active:scale-[0.98] w-full sm:w-auto"
          >
            <Plus className="h-5 w-5" /> 
            <span>Tạo mã mới</span>
          </button>
        </div>
      </div>

      {/* Modal Generate QR */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Liên kết QR mới</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleGenerate} className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2 uppercase tracking-wide">Loại tài sản <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setTargetType('COMPONENT'); setTargetId(''); }}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      targetType === 'COMPONENT' 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-4 h-4" /> Linh kiện lẻ
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTargetType('KIT'); setTargetId(''); }}
                    className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                      targetType === 'KIT' 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Box className="w-4 h-4" /> Bộ dụng cụ (Kit)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                  Chọn {targetType === 'COMPONENT' ? 'Linh kiện' : 'Kit'} <span className="text-rose-500">*</span>
                </label>
                <select 
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                >
                  <option value="" disabled>-- Chọn tài sản cần dán QR --</option>
                  {targetType === 'COMPONENT' 
                    ? components.map(c => <option key={c.id} value={c.id}>{c.name} ({c.identifier})</option>)
                    : kits.map(k => <option key={k.id} value={k.id}>{k.name} ({k.code})</option>)
                  }
                </select>
                <p className="text-[13px] text-slate-500 mt-2 flex items-center gap-1.5">
                  Mã QR sẽ được hệ thống sinh ngẫu nhiên và tự động liên kết.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={generating || !targetId} 
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang tạo...</span>
                  ) : (
                    <><QrCode className="w-5 h-5" /> Tạo & Liên kết QR</>
                  )}
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
              placeholder="Tìm theo mã QR hoặc ID tài sản..." 
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
                <th className="px-6 py-4">Mã QR (Code)</th>
                <th className="px-6 py-4">Mô phỏng in</th>
                <th className="px-6 py-4">Loại tài sản</th>
                <th className="px-6 py-4">ID Liên kết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5">
                      <LoadingSkeleton className="h-5 w-48 rounded-md" />
                    </td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-10 w-10 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-4 w-64 rounded-md" /></td>
                    <td className="px-6 py-5 flex justify-end"><LoadingSkeleton className="h-8 w-16 rounded-lg" /></td>
                  </tr>
                ))
              ) : filteredQRs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <QrCode className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Không có mã QR nào</h3>
                      <p className="text-slate-500">Chưa có mã QR nào được liên kết trong hệ thống.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQRs.map(qr => (
                  <tr key={qr.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-800 text-[15px]">{qr.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-white border border-slate-200 p-1 rounded cursor-pointer hover:border-blue-400 hover:shadow-md transition-all shadow-sm" onClick={() => handlePrintQR(qr.code)} title="In mã QR này">
                        <QRCodeReact value={qr.code} size={32} level="L" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${
                        qr.entity_type === 'KIT' 
                          ? 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' 
                          : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>
                        {qr.entity_type === 'KIT' ? <Box className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                        {qr.entity_type === 'KIT' ? 'Bộ dụng cụ (Kit)' : 'Linh kiện'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[13px] text-slate-500 max-w-[200px] truncate" title={qr.entity_id}>
                        {qr.entity_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handlePrintQR(qr.code)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" /> In tem
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
