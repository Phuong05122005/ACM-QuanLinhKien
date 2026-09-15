'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PickupLoanPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = React.use(params).id;
  
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`/api/loans/${id}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrCode })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Pickup failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/loans');
        }, 2000);
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Link href="/loans" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to My Loans
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md text-center border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Scan QR to Pickup</h1>
        <p className="text-gray-600 mb-8">Scan the physical item to confirm you have picked it up.</p>
        
        {success ? (
          <div className="bg-green-100 text-green-800 p-6 rounded mb-4 font-bold text-lg border border-green-200">
            ✅ Pickup Successful!
            <p className="text-sm font-normal mt-2">Redirecting to your loans...</p>
          </div>
        ) : (
          <form onSubmit={handleScan}>
            {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded text-sm text-left">{error}</div>}
            
            <div className="mb-6 relative">
              <input 
                type="text" 
                required
                className="w-full border-2 border-gray-300 p-4 rounded text-center text-xl uppercase font-mono focus:border-blue-500 focus:outline-none"
                value={qrCode}
                onChange={e => setQrCode(e.target.value.toUpperCase())}
                placeholder="QR-XXXX-XXXXXX"
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !qrCode}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Confirm Pickup'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
