'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditKitPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = React.use(params).id;
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'AVAILABLE',
    is_active: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/kits/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setFormData({
            name: d.data.name,
            code: d.data.code,
            description: d.data.description,
            status: d.data.status,
            is_active: d.data.is_active
          });
        }
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`/api/kits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to update kit');
      } else {
        router.push(`/kits/${id}`);
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href={`/kits/${id}`} className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Kit Details
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-6">Edit Kit Metadata</h1>
        
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
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Description</label>
            <textarea 
              className="w-full border p-2 rounded"
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Status</label>
            <select 
              required
              className="w-full border p-2 rounded"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="RESERVED">RESERVED</option>
              <option value="IN_USE">IN_USE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          
          <div className="mb-6 flex items-center">
            <input 
              type="checkbox" 
              id="is_active"
              className="mr-2 h-4 w-4"
              checked={formData.is_active}
              onChange={e => setFormData({...formData, is_active: e.target.checked})}
            />
            <label htmlFor="is_active" className="text-gray-700 font-medium">Active (Visible in Catalog)</label>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded shadow hover:bg-blue-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
