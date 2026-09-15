'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewKitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'AVAILABLE'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to create kit');
      } else {
        router.push(`/admin/kits/${data.data.id}/composition`);
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/kits" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Kits
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Create New Kit</h1>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Kit Name</label>
            <input 
              type="text" 
              required
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Raspberry Pi Starter Kit"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Kit Code (Unique identifier)</label>
            <input 
              type="text" 
              required
              className="w-full border p-2 rounded uppercase"
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="e.g. RPI-START-01"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Description</label>
            <textarea 
              className="w-full border p-2 rounded"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Basic starter kit containing board, cables, etc."
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium">Initial Status</label>
            <select 
              required
              className="w-full border p-2 rounded"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded shadow hover:bg-blue-700">
            Create Kit & Proceed to Composition
          </button>
        </form>
      </div>
    </div>
  );
}
