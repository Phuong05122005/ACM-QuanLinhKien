'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditComponentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    category_id: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch(`/api/components/${id}`).then(r => r.json())
    ]).then(([catData, compData]) => {
      if (catData.success) setCategories(catData.data);
      if (compData.success) {
        setFormData({
          name: compData.data.name,
          identifier: compData.data.identifier,
          category_id: compData.data.category_id,
          is_active: compData.data.is_active
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`/api/components/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to update component');
      } else {
        router.push(`/components/${id}`);
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href={`/components/${id}`} className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Component
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Component</h1>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              required
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category</label>
            <select 
              required
              className="w-full border p-2 rounded"
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              <option value="">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
            <label htmlFor="is_active" className="text-gray-700">Active (Visible in Catalog)</label>
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
            Update Component
          </button>
        </form>
      </div>
    </div>
  );
}
