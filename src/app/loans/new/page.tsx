'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewLoanPage() {
  const router = useRouter();
  const [components, setComponents] = useState<{id: string, name: string, available_quantity: number, kit_code?: string}[]>([]);
  const [kits, setKits] = useState<{id: string, name: string, available_quantity: number, kit_code?: string}[]>([]);
  
  const [cart, setCart] = useState<{ id: string, type: 'component' | 'kit', name: string, qty: number }[]>([]);
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/components?limit=100').then(r => r.json()),
      fetch('/api/kits').then(r => r.json())
    ]).then(([compData, kitData]) => {
      if (compData.success) setComponents(compData.data.items);
      if (kitData.success) setKits(kitData.data);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setReturnDate(tomorrow.toISOString().split('T')[0]);
    });
  }, []);

  const addToCart = (id: string, type: 'component' | 'kit', name: string) => {
    if (cart.length >= 5 && !cart.find(c => String((c as Record<string, unknown>).id) === id)) {
      setError('Maximum 5 different item types allowed per loan.');
      return;
    }
    setError('');
    
    setCart(prev => {
      const existing = prev.find(c => String((c as Record<string, unknown>).id) === id);
      if (existing) {
        return prev.map(c => String((c as Record<string, unknown>).id) === id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { id, type, name, qty: 1 }];
    });
  };

  const submitLoan = async () => {
    setError('');
    if (cart.length === 0) return setError('Cart is empty');
    
    const items = cart.map(c => ({
      component_id: c.type === 'component' ? String((c as Record<string, unknown>).id) : undefined,
      kit_id: c.type === 'kit' ? String((c as Record<string, unknown>).id) : undefined,
      quantity: c.qty
    }));

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected_return_date: new Date(returnDate).toISOString(),
          items
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Failed to submit loan request');
      } else {
        router.push('/loans');
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex gap-8">
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Request Loan</h1>
        
        <div className="mb-8 bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4">Available Kits</h2>
          <div className="grid grid-cols-2 gap-4">
            {kits.map(k => (
              <div key={String((k as Record<string, unknown>).id)} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{String(String((k as Record<string, unknown>).name))}</h3>
                  <p className="text-sm text-gray-500">Available: {Number((k as Record<string, unknown>).available_kits_count || 0)}</p>
                </div>
                <button 
                  disabled={Number((k as Record<string, unknown>).available_kits_count || 0) <= 0}
                  onClick={() => addToCart(String((k as Record<string, unknown>).id), 'kit', String(String((k as Record<string, unknown>).name)))}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4">Available Components</h2>
          <div className="grid grid-cols-2 gap-4">
            {components.map(c => (
              <div key={String((c as Record<string, unknown>).id)} className="border p-4 rounded flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{String((c as Record<string, unknown>).name)}</h3>
                  <p className="text-sm text-gray-500">Available: {Number((c as Record<string, unknown>).available_quantity)}</p>
                </div>
                <button 
                  disabled={Number((c as Record<string, unknown>).available_quantity) <= 0}
                  onClick={() => addToCart(String((c as Record<string, unknown>).id), 'component', String((c as Record<string, unknown>).name))}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="w-80">
        <div className="bg-white p-6 rounded shadow-md sticky top-8">
          <h2 className="text-xl font-bold mb-4">Your Request</h2>
          {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
          
          {cart.length === 0 ? (
            <p className="text-gray-500 italic mb-4">Cart is empty.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {cart.map(c => (
                <li key={String((c as Record<string, unknown>).id)} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium text-sm">{String((c as Record<string, unknown>).name)}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">x{c.qty}</span>
                </li>
              ))}
            </ul>
          )}
          
          <div className="mb-6">
            <label className="block font-medium mb-1 text-sm">Return Date</label>
            <input 
              type="date" 
              className="w-full border p-2 rounded"
              value={returnDate}
              onChange={e => setReturnDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <button 
            onClick={submitLoan}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded shadow hover:bg-blue-700"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
