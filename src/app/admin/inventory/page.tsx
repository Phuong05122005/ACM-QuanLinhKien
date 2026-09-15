'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function InventoryTransactionPage() { return <React.Suspense fallback={<div>Loading...</div>}><InventoryTransactionForm /></React.Suspense>; }
function InventoryTransactionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const componentId = searchParams.get('componentId');
  const typeParam = searchParams.get('type') || 'STOCK_IN';

  const [formData, setFormData] = useState({
    component_id: componentId || '',
    transaction_type: typeParam,
    quantity_change: 1,
    reference_id: ''
  });
  const [error, setError] = useState('');

  const isDecrease = ['STOCK_OUT', 'BORROW', 'DAMAGE', 'MISSING'].includes(formData.transaction_type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = {
        ...formData,
        quantity_change: isDecrease ? -Math.abs(formData.quantity_change) : Math.abs(formData.quantity_change)
      };

      const res = await fetch('/api/inventory/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Transaction failed');
      } else {
        router.push(`/components/${formData.component_id}`);
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {componentId && (
        <Link href={`/components/${componentId}`} className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Back to Component
        </Link>
      )}
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Inventory Transaction</h1>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Component ID</label>
            <input 
              type="text" 
              required
              readOnly={!!componentId}
              className={`w-full border p-2 rounded ${componentId ? 'bg-gray-100' : ''}`}
              value={formData.component_id}
              onChange={e => setFormData({...formData, component_id: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Transaction Type</label>
            <select 
              required
              className="w-full border p-2 rounded"
              value={formData.transaction_type}
              onChange={e => setFormData({...formData, transaction_type: e.target.value})}
            >
              <option value="STOCK_IN">STOCK_IN</option>
              <option value="STOCK_OUT">STOCK_OUT</option>
              <option value="ADJUSTMENT">ADJUSTMENT</option>
              <option value="DAMAGE">DAMAGE</option>
              <option value="MISSING">MISSING</option>
              <option value="MANUAL_OVERRIDE">MANUAL_OVERRIDE</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Quantity (Absolute Value)</label>
            <input 
              type="number" 
              min="1"
              required
              className="w-full border p-2 rounded"
              value={formData.quantity_change}
              onChange={e => setFormData({...formData, quantity_change: parseInt(e.target.value)})}
            />
            <p className="text-sm text-gray-500 mt-1">
              {isDecrease ? 'Will decrease inventory by this amount.' : 'Will increase inventory by this amount.'}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Reference / Notes (Optional)</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded"
              value={formData.reference_id}
              onChange={e => setFormData({...formData, reference_id: e.target.value})}
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
            Submit Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
