'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = React.use(params).id;
  
  const [loan, setLoan] = useState<{ code?: string, student_name?: string, expected_return_date?: string, status?: string, items?: { id: string, component_name: string, kit_name: string, kit_id: string, condition: string, quantity: number }[], history?: { id: string, status: string, notes?: string, created_at: string, changed_by_name: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRawLoan = async () => {
    const res = await fetch(`/api/loans/${id}`);
    return res.json();
  };

  const fetchLoan = async () => {
    try {
      const data = await fetchRawLoan();
      if (data.success) setLoan(data.data);
      else setError(data.error?.message || 'Error fetching loan');
    } catch(e) { setError('Network error'); }
  };

  useEffect(() => {
    let mounted = true;
    fetch(`/api/loans/${id}`)
      .then(res => res.json())
      .then(data => {
        if (mounted) {
          if (data.success) {
            setLoan(data.data);
          } else {
            setError(data.error?.message || 'Error fetching loan');
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Network error');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [id]);

  const handleTransition = async (status: string) => {
    setError('');
    try {
      const res = await fetch(`/api/loans/${id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Transition failed');
      } else {
        await fetchLoan();
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!loan) return <div className="p-8 text-red-600">{error || 'Loan not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/admin/loans" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Loans
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Loan {loan.code}</h1>
            <p className="text-gray-600">Student: {(loan.student_name || "")}</p>
            <p className="text-gray-600">Return Date: {new Date(loan.expected_return_date || "").toLocaleDateString()}</p>
          </div>
          <div>
            <span className={`px-4 py-2 text-sm font-bold rounded shadow-sm ${
              loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              loan.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
              loan.status === 'BORROWED' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
              loan.status === 'RETURNED' ? 'bg-green-100 text-green-800 border border-green-200' :
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {loan.status}
            </span>
          </div>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded border border-red-200 font-medium">{error}</div>}

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            {loan.status === 'PENDING' && (
              <button onClick={() => handleTransition('APPROVED')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 font-bold">Approve Loan (Deducts Inventory)</button>
            )}
            {loan.status === 'APPROVED' && (
              <button onClick={() => handleTransition('READY_FOR_PICKUP')} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 font-bold">Mark Ready for Pickup</button>
            )}
            {loan.status === 'READY_FOR_PICKUP' && (
              <button onClick={() => handleTransition('BORROWED')} className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 font-bold">Confirm Borrowed</button>
            )}
            {['BORROWED', 'OVERDUE', 'RETURN_REQUIRES_INSPECTION'].includes(loan.status || "") && (
              <>
                <button onClick={() => handleTransition('RETURNED')} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 font-bold">Mark Returned (Restores Inventory)</button>
                {loan.status === 'BORROWED' && <button onClick={() => handleTransition('RETURN_REQUIRES_INSPECTION')} className="bg-orange-500 text-white px-4 py-2 rounded shadow hover:bg-orange-600 font-bold">Requires Inspection</button>}
              </>
            )}
            {loan.status === 'RETURNED' && (
              <span className="text-green-600 font-bold italic">Loan completed successfully.</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow-md border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-4">Loan Items</h2>
        <ul className="space-y-2">
          {(loan.items || []).map((item: { id: string, component_name: string, kit_name: string, kit_id: string, condition: string, quantity: number }) => (
            <li key={item.id} className="flex justify-between border-b pb-2">
              <span>{item.component_name || item.kit_name} {item.kit_id ? '(Kit)' : '(Component)'}</span>
              <span className="font-bold">x{item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-50 p-6 rounded shadow-inner border border-gray-200">
        <h2 className="text-xl font-bold mb-4">History</h2>
        <ul className="space-y-4">
          {(loan.history || []).map((h: { id: string, status: string, notes?: string, created_at: string, changed_by_name: string }) => (
            <li key={h.id} className="text-sm">
              <span className="text-gray-500">{new Date(h.created_at).toLocaleString()}</span> - 
              <span className="font-bold ml-2">{h.status}</span> 
              <span className="text-gray-600 ml-2">by {h.changed_by_name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
