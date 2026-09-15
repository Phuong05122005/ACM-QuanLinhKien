import { pool } from '@/lib/pg';
import { successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    // Verify DB connection
    await pool.query('SELECT 1');
    
    return successResponse({ status: 'healthy', database: 'connected' });
  } catch (error: unknown) {
    return errorResponse('DB_ERROR', 'Service Unhealthy: Database disconnected', undefined, 503);
  }
}
