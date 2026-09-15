'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function KitCompositionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const id = React.use(params).id;
  
  const [kit, setKit] = useState<{ code: string, components: { kit_component_id: string, component_id: string, identifier?: string, name: string, expected_quantity: number }[], name: string, identifier?: string } | null>(null);
  const [availableComponents, setAvailableComponents] = useState<{ id: string, name: string, identifier?: string }[]>([]);
  
  const [selectedComponent, setSelectedComponent] = useState('');
  const [expectedQty, setExpectedQty] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRawData = async () => {
    const [kitRes, compRes] = await Promise.all([
      fetch(`/api/kits/${id}`),
      fetch('/api/components?limit=100')
    ]);
    return { kitData: await kitRes.json(), compData: await compRes.json() };
  };

  const fetchData = async () => {
    try {
      const { kitData, compData } = await fetchRawData();
      if (kitData.success) setKit(kitData.data);
      if (compData.success) setAvailableComponents(compData.data.items);
    } catch(e) {}
  };

  useEffect(() => {
    let mounted = true;
    fetchRawData().then(({ kitData, compData }) => {
      if (mounted) {
        if (kitData.success) setKit(kitData.data);
        if (compData.success) setAvailableComponents(compData.data.items);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) { setError('Failed to fetch data'); setLoading(false); }
    });
    return () => { mounted = false; };
  }, [id]);

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch(`/api/kits/${id}/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component_id: selectedComponent,
          expected_quantity: expectedQty
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to add component');
      } else {
        setSelectedComponent('');
        setExpectedQty(1);
        await fetchData(); // Refresh list
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  const handleRemoveComponent = async (componentId: string) => {
    if (!confirm('Are you sure you want to remove this component from the kit?')) return;
    
    try {
      const res = await fetch(`/api/kits/${id}/components/${componentId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error?.message || 'Failed to remove component');
      } else {
        await fetchData(); // Refresh list
        router.refresh();
      }
    } catch (error: unknown) {
      setError('An unexpected error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!kit) return <div className="p-8 text-red-600">Kit not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href={`/kits/${id}`} className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Kit Details
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200 mb-8">
        <h1 className="text-2xl font-bold mb-2">Manage Kit Composition</h1>
        <p className="text-gray-600 mb-6">{kit.name} ({kit.code})</p>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        
        <form onSubmit={handleAddComponent} className="flex gap-4 items-end bg-gray-50 p-4 rounded border border-gray-100">
          <div className="flex-1">
            <label className="block text-gray-700 mb-2 font-medium text-sm">Add Component</label>
            <select 
              required
              className="w-full border p-2 rounded"
              value={selectedComponent}
              onChange={e => setSelectedComponent(e.target.value)}
            >
              <option value="">Select a component...</option>
              {availableComponents
                .filter(c => !(kit?.components || []).find((kc: { kit_component_id: string, component_id: string, identifier?: string, name: string, expected_quantity: number }) => kc.component_id === c.id))
                .map(c => (
                <option key={c.id} value={c.id}>{String(c.name)} ({(String(c.identifier || ""))})</option>
              ))}
            </select>
          </div>
          
          <div className="w-32">
            <label className="block text-gray-700 mb-2 font-medium text-sm">Qty Required</label>
            <input 
              type="number" 
              min="1"
              required
              className="w-full border p-2 rounded"
              value={expectedQty}
              onChange={e => setExpectedQty(parseInt(e.target.value))}
            />
          </div>
          
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded shadow hover:bg-blue-700 h-[42px]">
            Add
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Current Composition</h2>
        {(kit?.components || []).length === 0 ? (
          <p className="text-gray-500 italic">No components added yet.</p>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700">
                <th className="py-3 px-4 font-semibold">Component</th>
                <th className="py-3 px-4 font-semibold">Identifier</th>
                <th className="py-3 px-4 font-semibold text-center">Expected Qty</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(kit?.components || []).map((c: { kit_component_id: string, component_id: string, identifier?: string, name: string, expected_quantity: number }) => (
                <tr key={String(c.kit_component_id)} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{String(c.name)}</td>
                  <td className="py-3 px-4 text-gray-500 text-sm">{(String(c.identifier || ""))}</td>
                  <td className="py-3 px-4 text-center font-bold">{Number(c.expected_quantity)}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleRemoveComponent(c.component_id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
