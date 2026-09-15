import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export default async function KitsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const session = await getSession();
  const isAdmin = session?.roles.includes('ADMIN') || session?.roles.includes('SUPER_ADMIN');

  const { search } = await searchParams;
  
  const queryParts = ['k.is_active = true'];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (search) {
    queryParts.push(`(k.name ILIKE $${paramIndex} OR k.code ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const dataQuery = `
    SELECT k.*, 
      COALESCE(
        MIN(FLOOR(c.available_quantity / NULLIF(kc.expected_quantity, 0))),
        0
      ) as available_kits_count
    FROM kits k
    LEFT JOIN kit_components kc ON k.id = kc.kit_id
    LEFT JOIN components c ON kc.component_id = c.id
    WHERE ${queryParts.join(' AND ')}
    GROUP BY k.id
    ORDER BY k.name ASC
  `;
  
  const dataRes = await pool.query(dataQuery, queryParams);
  const kits = dataRes.rows;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kits Catalog</h1>
        {isAdmin && (
          <Link href="/admin/kits/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            + New Kit
          </Link>
        )}
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100 mb-6">
        <form className="flex gap-4" method="GET" action="/kits">
          <input 
            type="text" 
            name="search" 
            defaultValue={search || ''} 
            placeholder="Search by name or code..." 
            className="border p-2 rounded w-full max-w-md text-gray-900" 
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
          {search && <Link href="/kits" className="bg-gray-200 px-4 py-2 rounded flex items-center">Clear</Link>}
        </form>
      </div>

      {kits.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          No kits found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map(kit => (
            <div key={kit.id} className="border rounded p-4 shadow-sm bg-white hover:shadow-md transition flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold">{kit.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{kit.code}</p>
                <div className="mb-4">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                    kit.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    kit.status === 'IN_USE' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {kit.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm border-t pt-3 mt-2">
                <span className="font-medium text-gray-700">
                  Can Assemble: {kit.available_kits_count}
                </span>
                <Link href={`/kits/${kit.id}`} className="text-blue-600 hover:underline font-medium">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
