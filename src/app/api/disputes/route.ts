import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { DisputeService } from '@/lib/dispute/service';
import { pool } from '@/lib/pg';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const body = await request.json();
    const { loan_id, reason } = body;

    if (!loan_id || !reason) {
      return errorResponse('VALIDATION_ERROR', 'Missing loan_id or reason', undefined, 400);
    }

    try {
      const dispute = await DisputeService.createDispute(loan_id, session.userId, reason);
      return successResponse(dispute, 201);
    } catch(e: unknown) { 
//error: unknown) {
      return errorResponse('VALIDATION_ERROR', (e !== null && typeof e === 'object' && 'code' in e) ? 'Database error occurred' : (e instanceof Error ? (e.message || 'Unknown error') : 'Unknown error'), undefined, 400);
    }
  } catch(e: unknown) { 
//error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');
    let query = '';
    let params: unknown[] = [];

    if (isAdmin) {
      query = `SELECT d.*, u.username as student_name, l.code as loan_code 
               FROM disputes d 
               JOIN users u ON d.user_id = u.id 
               JOIN loans l ON d.loan_id = l.id
               ORDER BY d.created_at DESC`;
    } else {
      query = `SELECT d.*, l.code as loan_code 
               FROM disputes d 
               JOIN loans l ON d.loan_id = l.id
               WHERE d.user_id = $1 
               ORDER BY d.created_at DESC`;
      params = [session.userId];
    }

    const res = await pool.query(query, params);
    return successResponse(res.rows);
  } catch(e: unknown) { 
//error: unknown) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
