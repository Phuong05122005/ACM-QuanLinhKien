'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewComponentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    identifier: '',
    category_id: '',
    total_quantity: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => {
        if (d.success) setCategories(d.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to create component');
      } else {
        router.push(`/components/${data.data.id}`);
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link href="/components" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Catalog
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Add New Component</h1>
        
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
            <label className="block text-gray-700 mb-2">Identifier (SKU/Code)</label>
            <input 
              type="text" 
              required
              className="w-full border p-2 rounded"
              value={formData.identifier}
              onChange={e => setFormData({...formData, identifier: e.target.value})}
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
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Initial Quantity</label>
            <input 
              type="number" 
              min="0"
              required
              className="w-full border p-2 rounded"
              value={formData.total_quantity}
              onChange={e => setFormData({...formData, total_quantity: parseInt(e.target.value)})}
            />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
            Create Component
          </button>
        </form>
      </div>
    </div>
  );
}
