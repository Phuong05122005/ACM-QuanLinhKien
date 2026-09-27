'use client';
import { useState } from 'react';
import { FileText, Download, Calendar, Activity, Box, ShieldAlert } from 'lucide-react';

export default function ReportsAdminPage() {
  const [reportType, setReportType] = useState('loans');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleExport = () => {
    let url = `/api/reports/export?type=${reportType}&format=csv`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    // Trigger download
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8 font-sans pb-8 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col justify-between items-start gap-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-[15px] text-slate-500 mt-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Trích xuất dữ liệu hệ thống ra tệp CSV để phân tích
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
        <div className="p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Download className="w-5 h-5 text-indigo-500" /> 
            Tùy chọn xuất báo cáo
          </h3>

          <div className="space-y-8">
            {/* Loại báo cáo */}
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wide">
                Loại báo cáo cần xuất <span className="text-rose-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setReportType('loans')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    reportType === 'loans' 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${reportType === 'loans' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className={`font-bold ${reportType === 'loans' ? 'text-blue-900' : 'text-slate-700'}`}>Mượn / Trả</h4>
                  <p className="text-[13px] text-slate-500 mt-1 line-clamp-2">Lịch sử và trạng thái các đơn mượn thiết bị.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('inventory')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    reportType === 'inventory' 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${reportType === 'inventory' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Box className="w-5 h-5" />
                  </div>
                  <h4 className={`font-bold ${reportType === 'inventory' ? 'text-emerald-900' : 'text-slate-700'}`}>Tồn kho</h4>
                  <p className="text-[13px] text-slate-500 mt-1 line-clamp-2">Danh sách linh kiện và số lượng khả dụng hiện tại.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('disputes')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    reportType === 'disputes' 
                      ? 'border-rose-500 bg-rose-50/50' 
                      : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${reportType === 'disputes' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className={`font-bold ${reportType === 'disputes' ? 'text-rose-900' : 'text-slate-700'}`}>Khiếu nại</h4>
                  <p className="text-[13px] text-slate-500 mt-1 line-clamp-2">Các báo cáo hỏng hóc, thiếu linh kiện và trạng thái xử lý.</p>
                </button>
              </div>
            </div>

            {/* Bộ lọc thời gian */}
            {reportType !== 'inventory' && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="block text-[13px] font-bold text-slate-700 mb-4 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Lọc theo thời gian tạo (Tùy chọn)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Từ ngày</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border border-slate-300 p-3 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Đến ngày</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border border-slate-300 p-3 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-sm"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {reportType === 'inventory' && (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Box className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 text-[14px]">Báo cáo thời gian thực</h4>
                  <p className="text-[13px] text-blue-700 mt-1">Báo cáo tồn kho luôn xuất ra dữ liệu mới nhất (Real-time) của tất cả các linh kiện nên không cần bộ lọc thời gian.</p>
                </div>
              </div>
            )}
            
            {/* Nút Xuất */}
            <div className="pt-4 flex justify-end">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
              >
                <Download className="w-5 h-5" /> Xuất dữ liệu (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
