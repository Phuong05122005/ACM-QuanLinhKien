import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { pool } from '@/lib/pg';
import { AuditService } from '@/lib/audit/service';

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  str = str.replace(/"/g, '""');
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str; // Formula injection protection
  }
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'loans';
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = '';
    const params: string[] = [];
    let dateFilter = '';
    
    if (startDate && endDate) {
      if (!isNaN(Date.parse(startDate)) && !isNaN(Date.parse(endDate))) {
        dateFilter = `WHERE created_at >= $1 AND created_at <= $2`;
        params.push(startDate, endDate);
      }
    } else if (startDate) {
      if (!isNaN(Date.parse(startDate))) {
        dateFilter = `WHERE created_at >= $1`;
        params.push(startDate);
      }
    } else if (endDate) {
      if (!isNaN(Date.parse(endDate))) {
        dateFilter = `WHERE created_at <= $1`;
        params.push(endDate);
      }
    }
    
    if (type === 'loans') {
      query = `SELECT id, loan_code, user_id, status, due_date, created_at FROM loans ${dateFilter} ORDER BY created_at DESC LIMIT 1000`;
    } else if (type === 'inventory') {
      query = `SELECT identifier, name, category_id, total_quantity, available_quantity FROM components ORDER BY name LIMIT 1000`;
      params.length = 0;
    } else if (type === 'disputes') {
      query = `SELECT id, loan_id, user_id, status, description, created_at FROM disputes ${dateFilter} ORDER BY created_at DESC LIMIT 1000`;
    } else {
      return new NextResponse('Invalid report type', { status: 400 });
    }

    const res = await pool.query(query, params);

    await AuditService.log(session.userId, 'EXPORT', 'reports', JSON.stringify({ type, format, record_count: res.rows.length }));

    if (format === 'csv') {
      const rows = res.rows;
      if (rows.length === 0) return new NextResponse('No data', { status: 200 });
      
      const header = Object.keys(rows[0]).join(',');
      const csvData = rows.map(r => Object.values(r).map(escapeCsvCell).join(',')).join('\n');
      
      const finalCsv = header + '\n' + csvData;

      const headers = new Headers();
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', `attachment; filename="${type}_export.csv"`);
      
      return new NextResponse(finalCsv, { headers });
    }

    return new NextResponse('Format not supported yet', { status: 400 });

  } catch (error: unknown) {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
