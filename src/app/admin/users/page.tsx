'use client';
import { useState, useEffect } from 'react';
import { Search, Shield, UserX, UserCheck, ShieldCheck, Mail, Hash, Ban, CheckCircle2, UserPlus, X, Loader2, ShieldAlert } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

type User = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  student_code: string | null;
  is_active: boolean;
  roles: string[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Add User Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    username: '',
    full_name: '',
    email: '',
    student_code: '',
    password: '',
    role: 'STUDENT'
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const loadData = async () => {
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.success && !ignore) {
          setUsers(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, [search, refresh]);

  const toggleUserStatus = async (user: User) => {
    if (!confirm(`Bạn có chắc muốn ${user.is_active ? 'VÔ HIỆU HÓA (Khóa)' : 'KÍCH HOẠT (Mở khóa)'} người dùng ${user.full_name}?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) {
        setRefresh(r => r + 1);
      } else {
        alert('Không thể thay đổi trạng thái.');
      }
    } catch (e) {
      alert('Đã có lỗi xảy ra.');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError('');
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          roles: [addForm.role]
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddOpen(false);
        setAddForm({ username: '', full_name: '', email: '', student_code: '', password: '', role: 'STUDENT' });
        setRefresh(r => r + 1);
      } else {
        setAddError(data.error?.message || 'Thêm người dùng thất bại.');
      }
    } catch (e) {
      setAddError('Lỗi kết nối máy chủ.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Người dùng & Phân quyền</h1>
          <p className="text-[15px] text-slate-500 mt-1.5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" /> Quản lý tài khoản sinh viên và quản trị viên
          </p>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-500/20 transition-all font-semibold active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, MSSV, hoặc username..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-[3px] focus:ring-indigo-500/15 focus:border-indigo-500 transition-all shadow-sm hover:border-slate-300"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold">{users.length}</span> tài khoản được tìm thấy
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-[12px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">MSSV</th>
                <th className="px-6 py-4">Vai trò (Roles)</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-10 w-48 rounded-md" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-32 rounded-full" /></td>
                    <td className="px-6 py-5"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                    <td className="px-6 py-5 flex justify-end"><LoadingSkeleton className="h-8 w-8 rounded-lg" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <UserX className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy người dùng</h3>
                      <p className="text-slate-500">Hãy thử thay đổi từ khóa tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className={`hover:bg-indigo-50/30 transition-colors group ${!user.is_active ? 'bg-slate-50/50 opacity-75' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-bold text-slate-800 text-[15px]">{user.full_name}</div>
                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{user.username}</span>
                          {user.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.student_code ? (
                        <span className="inline-flex items-center gap-1.5 font-mono text-[13px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                          <Hash className="w-3.5 h-3.5" /> {user.student_code}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[12px]">Không có</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map(r => {
                          const isSuper = r === 'SUPER_ADMIN';
                          const isAdmin = r === 'ADMIN';
                          return (
                            <span key={r} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                              isSuper ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                              isAdmin ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {(isSuper || isAdmin) && <ShieldCheck className="w-3 h-3" />}
                              {isSuper ? 'Quản trị cấp cao' : isAdmin ? 'Quản trị viên' : 'Sinh viên'}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border ${
                        user.is_active 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {user.is_active ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Ban className="w-3.5 h-3.5 text-rose-500" />}
                        {user.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleUserStatus(user)}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-all border shadow-sm active:scale-95 ${
                          user.is_active 
                            ? 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                        title={user.is_active ? 'Khóa tài khoản này' : 'Mở khóa tài khoản này'}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                Thêm tài khoản mới
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6">
              {addError && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-medium flex gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" /> {addError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại tài khoản <span className="text-rose-500">*</span></label>
                  <div className="flex gap-4">
                    <label className={`flex-1 border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center gap-2 ${addForm.role === 'STUDENT' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                      <input type="radio" name="role" value="STUDENT" className="sr-only" checked={addForm.role === 'STUDENT'} onChange={e => setAddForm({...addForm, role: e.target.value})} />
                      <span className="font-bold text-sm text-slate-800">Sinh viên</span>
                    </label>
                    <label className={`flex-1 border rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center gap-2 ${addForm.role === 'ADMIN' ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'}`}>
                      <input type="radio" name="role" value="ADMIN" className="sr-only" checked={addForm.role === 'ADMIN'} onChange={e => setAddForm({...addForm, role: e.target.value})} />
                      <span className="font-bold text-sm text-slate-800">Quản trị viên</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên đăng nhập <span className="text-rose-500">*</span></label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={addForm.username} onChange={e => setAddForm({...addForm, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu <span className="text-rose-500">*</span></label>
                  <input type="text" required minLength={8} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={addForm.full_name} onChange={e => setAddForm({...addForm, full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
                  <input type="email" required className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mã số sinh viên {addForm.role === 'ADMIN' && <span className="text-slate-400 font-normal">(Không bắt buộc)</span>}</label>
                  <input type="text" required={addForm.role === 'STUDENT'} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={addForm.student_code} onChange={e => setAddForm({...addForm, student_code: e.target.value})} />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                  Hủy bỏ
                </button>
                <button type="submit" disabled={addLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100">
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
