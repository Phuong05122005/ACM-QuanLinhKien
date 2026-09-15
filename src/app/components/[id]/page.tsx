import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/pg';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const isAdmin = session?.roles.includes('ADMIN') || session?.roles.includes('SUPER_ADMIN');

  const { id } = await params;

  const res = await pool.query(`
    SELECT c.*, cat.name as category_name
    FROM components c
    LEFT JOIN component_categories cat ON c.category_id = cat.id
    WHERE c.id = $1
  `, [id]);

  if (res.rows.length === 0) {
    notFound();
  }

  const component = res.rows[0];

  const historyRes = await pool.query(`
    SELECT t.*, u.username
    FROM inventory_transactions t
    LEFT JOIN audit_logs a ON a.resource = 'inventory' AND a.details LIKE '%' || t.component_id || '%' AND a.action = t.transaction_type AND ABS(EXTRACT(EPOCH FROM (a.created_at - t.created_at))) < 2
    LEFT JOIN users u ON u.id = a.user_id
    WHERE t.component_id = $1
    ORDER BY t.created_at DESC
    LIMIT 20
  `, [id]);
  
  // NOTE: the above join is a bit hacky to get the user, in a real app we'd link transaction to user directly.
  // Actually let's just get transactions. 
  
  const history = await pool.query(`
    SELECT * FROM inventory_transactions
    WHERE component_id = $1
    ORDER BY created_at DESC
    LIMIT 20
  `, [id]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link href="/components" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Back to Catalog
      </Link>
      
      <div className="bg-white p-8 rounded shadow-md border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{component.name}</h1>
            <p className="text-gray-500">Identifier: {component.identifier}</p>
          </div>
          {isAdmin && (
            <Link href={`/admin/components/${id}/edit`} className="bg-gray-100 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-200">
              Edit Component
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-1">Availability</h3>
            <p className="text-2xl font-bold text-green-600">{component.available_quantity} / {component.total_quantity}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-gray-700 mb-1">Category</h3>
            <p className="text-lg">{component.category_name || 'Uncategorized'}</p>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-8 border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
            <div className="flex gap-4">
              <Link href={`/admin/inventory?componentId=${id}&type=STOCK_IN`} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">Stock In</Link>
              <Link href={`/admin/inventory?componentId=${id}&type=STOCK_OUT`} className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-center">Stock Out</Link>
              <Link href={`/admin/inventory?componentId=${id}&type=MANUAL_OVERRIDE`} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 text-center">Manual Override</Link>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white p-8 rounded shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Inventory History</h2>
        {history.rows.length === 0 ? (
          <p className="text-gray-500 italic">No transaction history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Change</th>
                  <th className="py-2">Reference</th>
                </tr>
              </thead>
              <tbody>
                {history.rows.map(tx => (
                  <tr key={tx.id} className="border-b">
                    <td className="py-2 text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="py-2 text-sm">{tx.transaction_type}</td>
                    <td className={`py-2 text-sm font-bold ${tx.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                    </td>
                    <td className="py-2 text-sm">{tx.reference_id || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
