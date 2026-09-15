import { pool } from '@/lib/pg';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { createLoan } from '@/lib/loan/service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const { searchParams } = new URL(request.url);
    const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');
    
    let dataQuery = '';
    let queryParams: unknown[] = [];
    
    if (isAdmin) {
      dataQuery = `
        SELECT l.*, u.username as student_name
        FROM loans l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
      `;
    } else {
      dataQuery = `
        SELECT l.*
        FROM loans l
        WHERE l.user_id = $1
        ORDER BY l.created_at DESC
      `;
      queryParams = [session.userId];
    }
    
    const dataRes = await pool.query(dataQuery, queryParams);
    return successResponse(dataRes.rows);
  } catch(e: unknown) { 
//error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const body = await request.json();
    const { expected_return_date, items } = body;

    if (!expected_return_date || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Missing required fields or items', undefined, 400);
    }

    try {
      const loan = await createLoan(session.userId, expected_return_date, items);
      return successResponse(loan, 201);
    } catch(e: unknown) { 
//error: unknown) {
      return errorResponse('VALIDATION_ERROR', (e !== null && typeof e === 'object' && 'code' in e) ? 'Database error occurred' : (e instanceof Error ? (e.message || 'Unknown error') : 'Unknown error'), undefined, 400);
    }
  } catch(e: unknown) { 
//error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
