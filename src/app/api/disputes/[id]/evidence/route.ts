import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';
import { StorageService } from '@/lib/storage/service';
import { DisputeService } from '@/lib/dispute/service';
import { pool } from '@/lib/pg';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return errorResponse('UNAUTHORIZED', 'Unauthorized', undefined, 401);

    const { id: disputeId } = await params;
    const isAdmin = session.roles.includes('ADMIN') || session.roles.includes('SUPER_ADMIN');
    
    // Auth check
    const disputeRes = await pool.query(`SELECT * FROM disputes WHERE id = $1`, [disputeId]);
    if (disputeRes.rows.length === 0) return errorResponse('NOT_FOUND', 'Dispute not found', undefined, 404);
    
    const dispute = disputeRes.rows[0];
    if (!isAdmin && dispute.user_id !== session.userId) {
      return errorResponse('FORBIDDEN', 'Access denied', undefined, 403);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return errorResponse('VALIDATION_ERROR', 'No file uploaded', undefined, 400);

    let filename: string;
    try {
      filename = await StorageService.saveEvidence(file, session.userId);
    } catch(e: unknown) { 
//error: any) {
      return errorResponse('VALIDATION_ERROR', (e !== null && typeof e === 'object' && 'code' in e) ? 'Database error occurred' : (e instanceof Error ? (e.message || 'Unknown error') : 'Unknown error'), undefined, 400);
    }

    try {
      const evidence = await DisputeService.addEvidence(disputeId, session.userId, filename);
      return successResponse(evidence, 201);
    } catch(e: unknown) { 
//error: any) {
      return errorResponse('VALIDATION_ERROR', (e !== null && typeof e === 'object' && 'code' in e) ? 'Database error occurred' : (e instanceof Error ? (e.message || 'Unknown error') : 'Unknown error'), undefined, 400);
    }
  } catch(e: unknown) { 
//error: any) {
    return errorResponse('SERVER_ERROR', 'Internal server error', undefined, 500);
  }
}
