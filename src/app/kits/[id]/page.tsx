import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/pg';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function KitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const isAdmin = session?.roles.includes('ADMIN') || session?.roles.includes('SUPER_ADMIN');

  const { id } = await params;

  const res = await pool.query(`
    SELECT k.*, 
      COALESCE(
        MIN(FLOOR(c.available_quantity / NULLIF(kc.expected_quantity, 0))),
        0
      ) as available_kits_count
    FROM kits k
    LEFT JOIN kit_components kc ON k.id = kc.kit_id
    LEFT JOIN components c ON kc.component_id = c.id
    WHERE k.id = $1
    GROUP BY k.id
  `, [id]);

  if (res.rows.length === 0) {
    notFound();
  }

  const kit = res.rows[0];

  const compRes = await pool.query(`
    SELECT kc.id as kit_component_id, kc.expected_quantity, c.id as component_id, c.name, c.identifier, c.available_quantity
    FROM kit_components kc
    JOIN components c ON kc.component_id = c.id
    WHERE kc.kit_id = $1
    ORDER BY c.name ASC
  `, [id]);
  
  const components = compRes.rows;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <Link href="/kits" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Kits
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{kit.name}</h1>
            <p className="text-gray-500">Code: {kit.code}</p>
            <p className="text-gray-700 mt-2 max-w-2xl">{kit.description}</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2 flex-col items-end">
              <Link href={`/admin/kits/${id}/edit`} className="bg-gray-100 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-200 text-sm">
                Edit Kit Details
              </Link>
              <Link href={`/admin/kits/${id}/composition`} className="bg-blue-50 text-blue-800 px-4 py-2 rounded shadow hover:bg-blue-100 text-sm font-medium border border-blue-200">
                Manage Composition
              </Link>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-1 text-sm">Status</h3>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
              kit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
              kit.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {kit.status}
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-1 text-sm">Maximum Assembleable</h3>
            <p className="text-2xl font-bold text-gray-900">{kit.available_kits_count}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-6">Kit Composition</h2>
        {components.length === 0 ? (
          <p className="text-gray-500 italic">No components defined for this kit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700">
                  <th className="py-3 px-4 font-semibold">Component</th>
                  <th className="py-3 px-4 font-semibold">Identifier</th>
                  <th className="py-3 px-4 font-semibold">Expected Qty</th>
                  <th className="py-3 px-4 font-semibold">Inventory Available</th>
                  <th className="py-3 px-4 font-semibold">Bottleneck</th>
                </tr>
              </thead>
              <tbody>
                {components.map(c => {
                  const maxPossible = Math.floor(c.available_quantity / c.expected_quantity);
                  const isBottleneck = maxPossible === kit.available_kits_count;
                  return (
                    <tr key={c.kit_component_id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4">
                        <Link href={`/components/${c.component_id}`} className="text-blue-600 hover:underline">{c.name}</Link>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{c.identifier}</td>
                      <td className="py-3 px-4 font-medium">{c.expected_quantity}</td>
                      <td className="py-3 px-4 text-gray-700">{c.available_quantity}</td>
                      <td className="py-3 px-4">
                        {isBottleneck && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Limits Assembly</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
