import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export default async function ComponentsPage({ searchParams }: { searchParams: { search?: string; category?: string } }) {
  const session = await getSession();
  const isAdmin = session?.roles.includes('ADMIN') || session?.roles.includes('SUPER_ADMIN');

  const search = searchParams.search || '';
  const categoryId = searchParams.category || '';

  const queryParts = ['1=1'];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (search) {
    queryParts.push(`(c.name ILIKE $${paramIndex} OR c.identifier ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (categoryId) {
    queryParts.push(`c.category_id = $${paramIndex}`);
    queryParams.push(categoryId);
    paramIndex++;
  }

  const dataQuery = `
    SELECT c.*, cat.name as category_name
    FROM components c
    LEFT JOIN component_categories cat ON c.category_id = cat.id
    WHERE ${queryParts.join(' AND ')}
    ORDER BY c.name ASC
  `;
  
  const dataRes = await pool.query(dataQuery, queryParams);
  const components = dataRes.rows;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Component Catalog</h1>
        {isAdmin && (
          <Link href="/admin/components/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
            + New Component
          </Link>
        )}
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm border border-gray-100 mb-6">
        <form className="flex gap-4" method="GET" action="/components">
          <input 
            type="text" 
            name="search" 
            defaultValue={search} 
            placeholder="Search by name or identifier..." 
            className="border p-2 rounded w-full max-w-md text-gray-900" 
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
          {search && <Link href="/components" className="bg-gray-200 px-4 py-2 rounded flex items-center">Clear</Link>}
        </form>
      </div>

      {components.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          No components found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map(comp => (
            <div key={comp.id} className="border rounded p-4 shadow-sm bg-white hover:shadow-md transition">
              <h3 className="text-lg font-bold">{comp.name}</h3>
              <p className="text-gray-600 text-sm mb-4">Category: {comp.category_name || 'Uncategorized'}</p>
              <div className="flex justify-between items-center text-sm">
                <span className={`font-medium ${comp.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comp.available_quantity} Available
                </span>
                <Link href={`/components/${comp.id}`} className="text-blue-600 hover:underline">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
