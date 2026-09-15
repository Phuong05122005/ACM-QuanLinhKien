import { z } from 'zod';
import { errorResponse } from './api';

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = result.error.issues[0];
    return {
      success: false,
      response: errorResponse('VALIDATION_ERROR', error.message || 'Validation error', error.path.join('.')),
    };
  }
  return { success: true, data: result.data };
}
