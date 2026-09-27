import { getSession } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (!session.roles.includes('ADMIN') && !session.roles.includes('SUPER_ADMIN'))) {
      return errorResponse('FORBIDDEN', 'Forbidden', undefined, 403);
    }
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return errorResponse('VALIDATION_ERROR', 'No file provided', undefined, 400);
    }
    
    const ext = path.extname(file.name || '').toLowerCase() || '.png';
    const randomHex = crypto.randomBytes(8).toString('hex');
    const filename = `img_${Date.now()}_${randomHex}${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);
    
    return successResponse({ url: `/uploads/${filename}` });
  } catch (err) {
    return errorResponse('SERVER_ERROR', 'Failed to upload', undefined, 500);
  }
}
