import React from 'react';
import { pool } from '@/lib/pg';

export const dynamic = 'force-dynamic';

export default async function AdminDisputesPage() {
  const res = await pool.query(`
    SELECT d.*, l.code as loan_code, u.username as student_name
    FROM disputes d
    JOIN loans l ON d.loan_id = l.id
    JOIN users u ON d.user_id = u.id
    ORDER BY CASE WHEN d.status = 'PENDING' THEN 1 WHEN d.status = 'UNDER_REVIEW' THEN 2 ELSE 3 END, d.created_at DESC
  `);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage Disputes</h1>
      <div className="bg-white rounded shadow-sm border p-4">
        {res.rows.length === 0 ? <p className="text-gray-500">No disputes found.</p> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Loan</th>
                <th>Student</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {res.rows.map(d => (
                <tr key={d.id} className="border-b">
                  <td className="py-2 font-medium">{d.loan_code}</td>
                  <td>{d.student_name}</td>
                  <td><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold">{d.status}</span></td>
                  <td className="text-sm text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                  <td>
                    {/* Add management link here if we make an [id] page later */}
                    <span className="text-blue-600 hover:underline cursor-pointer">Manage</span>
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
