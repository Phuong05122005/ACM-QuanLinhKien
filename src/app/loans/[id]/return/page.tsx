'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReturnLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = React.use(params).id;
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const [scanResult, setScanResult] = useState<{action?: string, category?: string, confidence?: number, items: {component_type: string, condition: string, quantity: number, confidence: number}[]} | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setError('');
    setUploading(true);
    setScanResult(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/loans/${id}/return`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to upload/scan');
      } else {
        setScanResult(data.data);
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    setError('');
    setConfirming(true);
    
    try {
      const res = await fetch(`/api/loans/${id}/return/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_id: (scanResult as Record<string, unknown>)?.scan_id as string })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Confirmation failed');
      } else {
        setSuccessMsg(data.data.message);
        setTimeout(() => router.push('/loans'), 2000);
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/loans" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to My Loans
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Return Kit</h1>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        {successMsg && <div className="mb-4 text-green-700 bg-green-50 p-4 rounded font-bold border border-green-200">✅ {successMsg}</div>}
        
        {!scanResult && !successMsg && (
          <form onSubmit={handleUpload}>
            <p className="text-gray-600 mb-4">Please upload a clear photo or short video of the kit and all its components to proceed with the return. Our AI will automatically inspect the contents.</p>
            <div className="mb-6 border-2 border-dashed border-gray-300 p-8 text-center rounded bg-gray-50">
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                onChange={handleFileChange}
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500 mt-2">Allowed: JPG, PNG, WEBP, MP4, MOV (Max 10MB)</p>
            </div>
            
            <button 
              type="submit" 
              disabled={uploading || !file}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Processing AI Inspection...' : 'Upload & Inspect'}
            </button>
          </form>
        )}

        {scanResult && !successMsg && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">AI Inspection Results</h2>
            
            <div className={`p-4 rounded mb-6 border ${
              scanResult.category === 'NORMAL' ? 'bg-green-50 border-green-200' :
              scanResult.category === 'UNKNOWN' ? 'bg-gray-50 border-gray-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <h3 className="font-bold text-lg mb-1">Status: {scanResult.category}</h3>
              <p className="text-sm">Confidence Score: {(scanResult?.confidence as number * 100).toFixed(1)}%</p>
              
              {scanResult.action !== 'AUTO_APPROVE' && (
                <p className="text-orange-700 text-sm mt-2 font-medium">⚠️ This return will require manual Admin review after confirmation.</p>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Detected Items:</h3>
              {scanResult?.items.length === 0 ? (
                <p className="text-gray-500 italic">No items detected or AI service failed gracefully.</p>
              ) : (
                <ul className="space-y-2">
                  {scanResult?.items.map((item: {component_type: string, condition: string, quantity: number, confidence: number}, idx: number) => (
                    <li key={idx} className="flex justify-between bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                      <span className="font-medium">{item.component_type} (x{item.quantity})</span>
                      <span className={`${item.condition === 'MISSING' || item.condition === 'DAMAGED' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                        {item.condition} ({(item.confidence * 100).toFixed(0)}%)
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 mb-6 border border-blue-200">
              By confirming, you agree to submit these results for your return. The AI is advisory only and does not automatically declare guilt.
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setScanResult(null)}
                className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded shadow hover:bg-gray-300"
              >
                Retake Photo
              </button>
              <button 
                onClick={handleConfirm}
                disabled={confirming}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded shadow hover:bg-blue-700 disabled:opacity-50"
              >
                {confirming ? 'Submitting...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
