'use client';
import { useState, useEffect } from 'react';
import { Search, History, Activity, User, FileText, Database, ShieldAlert, LogIn, Plus, Edit2, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type AuditLog = {
  id: string;
  action: string;
  target_entity: string;
  details: string;
  created_at: string;
  username: string;
};

const getActionBadge = (action: string) => {
  const normalizedAction = action?.toUpperCase() || 'UNKNOWN';
  
  if (normalizedAction.includes('CREATE')) {
    return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <Plus className="w-3.5 h-3.5" /> };
  } else if (normalizedAction.includes('UPDATE') || normalizedAction.includes('EDIT')) {
    return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Edit2 className="w-3.5 h-3.5" /> };
  } else if (normalizedAction.includes('DELETE') || normalizedAction.includes('REMOVE')) {
    return { color: 'bg-rose-100 text-rose-700 border-rose-200', icon: <Trash2 className="w-3.5 h-3.5" /> };
  } else if (normalizedAction.includes('LOGIN')) {
    return { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: <LogIn className="w-3.5 h-3.5" /> };
  } else if (normalizedAction.includes('EXPORT') || normalizedAction.includes('REPORT')) {
    return { color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', icon: <FileText className="w-3.5 h-3.5" /> };
  } else if (normalizedAction.includes('FAIL') || normalizedAction.includes('ERROR')) {
    return { color: 'bg-red-100 text-red-700 border-red-200', icon: <ShieldAlert className="w-3.5 h-3.5" /> };
  }
  
  return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <Activity className="w-3.5 h-3.5" /> };
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        const res = await fetch(`/api/admin/audit?limit=200`);
        const data = await res.json();
        if (data.success && !ignore) {
          setLogs(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, []);

  const filteredLogs = logs.filter(l => 
    l.username?.toLowerCase().includes(search.toLowerCase()) || 
    l.action?.toLowerCase().includes(search.toLowerCase()) || 
    l.details?.toLowerCase().includes(search.toLowerCase()) ||
    l.target_entity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nhật ký hoạt động</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Lịch sử thao tác hệ thống, dữ liệu chỉ đọc không thể chỉnh sửa
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo người dùng, hành động, nội dung..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-slate-500/15 focus:border-slate-500 transition-all shadow-sm hover:border-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="text-[13px] font-semibold text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            Hiển thị {filteredLogs.length} bản ghi gần nhất
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[12px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Đối tượng (Entity)</th>
                <th className="px-6 py-4 w-1/3">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-32 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-24 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-28 rounded-full" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-20 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-5 w-full max-w-md rounded-md" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <History className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy nhật ký</h3>
                      <p className="text-slate-500">Chưa có hoạt động nào khớp với từ khóa tìm kiếm của bạn.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-mono text-[13px] font-medium text-slate-700">
                          {new Date(log.created_at).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-800">{log.username || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase border ${badge.color}`}>
                          {badge.icon}
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.target_entity ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[12px] font-mono border border-slate-200">
                            <Database className="w-3 h-3" />
                            {log.target_entity}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[13px] text-slate-600 max-w-lg truncate" title={log.details}>
                          {log.details || <span className="text-slate-400 italic">Không có chi tiết</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
