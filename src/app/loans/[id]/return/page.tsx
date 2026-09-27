'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Camera, CheckCircle2, Loader2, Upload } from 'lucide-react';

export default function ReturnPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [aiResult, setAiResult] = useState<{ ai_status: string; discrepancy_details?: string } | null>(null);

  const handleSimulateScan = async () => {
    setLoading(true);
    // Simulate AI upload and processing
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/loans/${id}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: 'https://fake-s3/image.jpg' })
        });
        const data = await res.json();
        if (data.success) {
          setAiResult(data.data.scan); // has ai_status
          setStep(2);
        }
      } catch (e) {
        alert('Lỗi khi gửi ảnh');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/loans/${id}/return/confirm`, {
        method: 'POST'
      });
      if (res.ok) {
        setStep(3);
      }
    } catch (e) {
      alert('Lỗi xác nhận');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Hoàn tất quy trình trả</h1>
        <p className="text-slate-600 mb-8">
          Đơn mượn đã chuyển sang trạng thái chờ kiểm tra (Requires Inspection). Quản trị viên sẽ xem xét kết quả AI.
        </p>
        <button onClick={() => router.push('/loans')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">Về danh sách đơn</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Trả linh kiện (AI Inspection)</h1>
        <p className="text-sm text-slate-500 mt-1">Chụp ảnh bộ linh kiện của bạn để hệ thống AI đánh giá tự động.</p>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="h-40 bg-slate-100 rounded-xl mb-6 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-col gap-2 cursor-pointer hover:bg-slate-50 hover:text-blue-500 transition-colors">
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">Nhấn để chụp ảnh hoặc tải lên</span>
          </div>

          <button 
            onClick={handleSimulateScan}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            Phân tích ảnh
          </button>
        </div>
      )}

      {step === 2 && aiResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-lg mb-4">Kết quả từ AI</h3>
            <div className={`p-4 rounded-xl border ${aiResult.ai_status === 'DISCREPANCY' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
              <p className="font-bold mb-1">{aiResult.ai_status === 'DISCREPANCY' ? 'Phát hiện sai lệch' : 'Bình thường'}</p>
              <p className="text-sm opacity-90">{aiResult.discrepancy_details || 'Tất cả linh kiện đều đầy đủ và đúng số lượng.'}</p>
            </div>
            
            <p className="text-sm text-slate-500 mt-6 italic">Lưu ý: Kết quả AI chỉ mang tính tham khảo. Quản trị viên sẽ đưa ra quyết định cuối cùng.</p>
          </div>
          <div className="p-6 bg-slate-50 flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 bg-white border border-slate-300 text-slate-700 py-2.5 rounded-lg font-medium hover:bg-slate-100">
              Chụp lại
            </button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 flex justify-center items-center bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Xác nhận nộp'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
