import React from 'react';
import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function StudentDisputesPage() {
  const session = await getSession();
  const res = await pool.query(`
    SELECT d.*, l.code as loan_code
    FROM disputes d
    JOIN loans l ON d.loan_id = l.id
    WHERE d.user_id = $1
    ORDER BY d.created_at DESC
  `, [session?.userId]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Disputes</h1>
      <div className="bg-white rounded shadow-sm border p-4">
        {res.rows.length === 0 ? <p className="text-gray-500">No disputes found.</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Loan Code</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {res.rows.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="py-2">{d.loan_code}</td>
                  <td><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{d.status}</span></td>
                  <td>{d.reason.substring(0, 50)}...</td>
                  <td className="text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
