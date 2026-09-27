'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QrCode, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export default function PickupPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<{ status: string; loan_code: string; due_date: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLoan = () => {
    fetch(`/api/loans/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setLoan(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchLoan();
  }, [id]);

  const handlePickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/loans/${id}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrInput })
      });
      if (res.ok) {
        fetchLoan();
        router.refresh();
      } else {
        const err = await res.json();
        setErrorMsg(err.error?.message || 'Lỗi xác thực QR');
      }
    } catch (e) {
      setErrorMsg('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8"><LoadingSkeleton className="h-64 w-full max-w-md mx-auto" /></div>;
  if (!loan) return <div className="p-8 text-center text-red-600">Không tìm thấy đơn mượn.</div>;

  const isReady = loan.status === 'READY_FOR_PICKUP' || loan.status === 'APPROVED';
  const isBorrowed = loan.status === 'BORROWED';

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Xác thực Nhận Kit</h1>
        <p className="text-sm text-slate-500 mt-1">
          {isBorrowed ? 'Đã xác thực nhận hàng thành công.' : 'Nhập mã QR trên Kit/Linh kiện để xác thực.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-center p-8">
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-800">
            {loan.loan_code}
          </span>
        </div>

        {isBorrowed ? (
          <div className="h-48 flex items-center justify-center bg-green-50 border border-green-200 rounded-xl mb-6 flex-col gap-3 text-green-600">
            <CheckCircle2 className="h-10 w-10" />
            <span className="text-sm font-medium">Đã nhận hàng</span>
          </div>
        ) : isReady ? (
          <form onSubmit={handlePickup} className="mb-6 text-left">
            <label className="block text-sm font-medium text-slate-700 mb-2">Mã QR</label>
            <input 
              type="text" 
              required
              value={qrInput}
              onChange={e => setQrInput(e.target.value)}
              placeholder="Nhập mã QR..."
              className="w-full border border-slate-300 rounded-lg p-3 mb-4"
            />
            {errorMsg && <p className="text-red-600 text-sm mb-4">{errorMsg}</p>}
            <button type="submit" disabled={submitting || !qrInput} className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700">
              {submitting ? 'Đang xử lý...' : 'Xác thực nhận hàng'}
            </button>
          </form>
        ) : (
          <div className="h-48 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl mb-6 flex-col gap-3 text-slate-400">
            <AlertCircle className="h-10 w-10" />
            <span className="text-sm font-medium">Chưa sẵn sàng nhận</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm border-t border-slate-100 pt-4">
          <Calendar className="h-4 w-4" />
          <span>Hạn trả: {new Date(loan.due_date).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
}
