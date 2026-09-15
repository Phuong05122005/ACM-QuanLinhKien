import React from 'react';
import Link from 'next/link';
import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoansPage() {
  const session = await getSession();
  
  const res = await pool.query(`
    SELECT l.*, u.username as student_name
    FROM loans l
    JOIN users u ON l.user_id = u.id
    ORDER BY CASE 
      WHEN l.status = 'PENDING' THEN 1
      WHEN l.status = 'APPROVED' THEN 2
      WHEN l.status = 'READY_FOR_PICKUP' THEN 3
      WHEN l.status = 'BORROWED' THEN 4
      WHEN l.status = 'OVERDUE' THEN 5
      ELSE 6
    END ASC, l.created_at DESC
  `);
  
  const loans = res.rows;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Manage Loans</h1>
      
      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        {loans.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No loans found.</div>
        ) : (
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700">Code</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 font-semibold text-gray-700">Return Date</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{loan.code}</td>
                  <td className="py-3 px-4">{loan.student_name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      loan.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      loan.status === 'BORROWED' ? 'bg-purple-100 text-purple-800' :
                      loan.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(loan.expected_return_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/loans/${loan.id}`} className="text-blue-600 font-medium hover:underline">
                      Manage &rarr;
                    </Link>
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
