'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminQRPage() {
  const [targetType, setTargetType] = useState('KIT');
  const [targetId, setTargetId] = useState('');
  const [kits, setKits] = useState<{ id: string, identifier?: string, name?: string, code?: string }[]>([]);
  const [components, setComponents] = useState<{ id: string, identifier?: string, name?: string, code?: string }[]>([]);
  const [generatedQr, setGeneratedQr] = useState<{ code?: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/kits').then(r => r.json()),
      fetch('/api/components?limit=100').then(r => r.json())
    ]).then(([kData, cData]) => {
      if (kData.success) setKits(kData.data);
      if (cData.success) setComponents(cData.data.items);
    });
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGeneratedQr(null);
    
    try {
      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to generate QR');
      } else {
        setGeneratedQr(data.data);
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage QR Codes</h1>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Generate QR Code</h2>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>}
        
        <form onSubmit={handleGenerate} className="flex gap-4 items-end">
          <div className="w-48">
            <label className="block text-gray-700 mb-2 font-medium text-sm">Target Type</label>
            <select 
              className="w-full border p-2 rounded"
              value={targetType}
              onChange={e => { setTargetType(e.target.value); setTargetId(''); }}
            >
              <option value="KIT">KIT</option>
              <option value="COMPONENT">COMPONENT</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-gray-700 mb-2 font-medium text-sm">Select Item</label>
            <select 
              required
              className="w-full border p-2 rounded"
              value={targetId}
              onChange={e => setTargetId(e.target.value)}
            >
              <option value="">Select...</option>
              {targetType === 'KIT' 
                ? kits.map(k => <option key={k.id} value={k.id}>{k.name} ({k.code})</option>)
                : components.map(c => <option key={c.id} value={c.id}>{c.name} ({c.identifier})</option>)
              }
            </select>
          </div>
          
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-blue-700 h-[42px]">
            Generate
          </button>
        </form>
        
        {generatedQr && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded text-center">
            <h3 className="font-bold text-lg mb-2">Successfully Generated</h3>
            <div className="bg-white p-4 inline-block shadow-sm border border-gray-200 mb-2">
              {/* Fake QR code visualization */}
              <div className="w-32 h-32 bg-gray-900 border-4 border-white mx-auto flex items-center justify-center">
                <span className="text-white font-mono text-xs text-center p-2 opacity-50">QR DATA</span>
              </div>
            </div>
            <p className="font-mono text-2xl font-bold tracking-wider">{generatedQr.code}</p>
            <p className="text-sm text-gray-500 mt-2">Any existing QR codes for this target have been disabled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
