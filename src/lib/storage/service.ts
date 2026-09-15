import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class StorageService {
  static async saveEvidence(file: File, userId: string): Promise<string> {
    if (!file) throw new Error('No file provided');
    if (file.size > MAX_FILE_SIZE) throw new Error('File exceeds 10MB limit');
    
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Invalid MIME type: ${file.type}`);
    }

    const originalName = file.name || 'unknown';
    const ext = path.extname(originalName).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Invalid extension: ${ext}`);
    }

    // Randomized secure filename: [timestamp]-[random hex][ext]
    const randomHex = crypto.randomBytes(16).toString('hex');
    const filename = `${Date.now()}-${randomHex}${ext}`;
    
    const uploadDir = path.join(process.cwd(), 'private_uploads');
    const filePath = path.join(uploadDir, filename);

    // Write file securely
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(filePath, buffer);

    return filename;
  }
}
