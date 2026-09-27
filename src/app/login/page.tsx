
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Loader2, AlertCircle, User, Lock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error?.code === 'AUTH_ERROR' && data.error?.message?.includes('locked')) {
          setError('Tài khoản tạm khóa trong 15 phút do nhập sai quá nhiều lần.');
        } else {
          setError('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error: unknown) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-slate-900">
      {/* Left side - Brand/Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40V0H40" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-12">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Box className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ACM System</span>
          </div>
          <div className="mt-24">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15]">
              Quản lý thiết bị <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                và linh kiện thông minh.
              </span>
            </h1>
            <p className="text-slate-400 text-lg mt-6 max-w-md leading-relaxed">
              Hệ thống quản lý mượn trả và kiểm kê linh kiện phòng lab tự động dành cho sinh viên và giảng viên.
            </p>
          </div>
        </div>
        
        <div className="relative z-10 text-slate-500 text-sm font-medium">
          &copy; 2026 ACM System. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 lg:p-24 bg-slate-50 lg:bg-white relative">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex flex-col items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Box className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">ACM System</span>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Đăng nhập</h2>
            <p className="text-slate-500 mt-2.5 text-[15px]">Vui lòng nhập thông tin để truy cập hệ thống</p>
          </div>
          
          {error && (
            <div className="mb-8 flex items-start gap-3 p-4 bg-red-50 text-red-700 text-[14px] rounded-xl border border-red-100" data-testid="error-message">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[14px] font-semibold text-slate-700">Tên đăng nhập</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all disabled:bg-slate-50 shadow-sm hover:border-slate-300" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  data-testid="username-input"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[14px] font-semibold text-slate-700">Mật khẩu</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] focus:outline-none focus:ring-[3px] focus:ring-blue-500/15 focus:border-blue-500 transition-all disabled:bg-slate-50 shadow-sm hover:border-slate-300" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  data-testid="password-input"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.98] mt-4",
                loading ? "opacity-70 cursor-not-allowed shadow-none" : "hover:bg-blue-700 hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5"
              )}
              data-testid="login-button"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
