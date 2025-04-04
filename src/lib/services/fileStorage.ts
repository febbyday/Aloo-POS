import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Types
export const FileStorageConfigSchema = z.object({
  basePath: z.string(),
  allowedTypes: z.array(z.string()),
  maxFileSize: z.number().min(1),
  compression: z.boolean().optional(),
  accessControl: z.enum(['private', 'public']).optional(),
  storageType: z.enum(['local', 's3', 'azure']),
});

export type FileStorageConfig = z.infer<typeof FileStorageConfigSchema>;

export interface FileMetadata {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  module: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface UploadResult {
  success: boolean;
  file?: FileMetadata;
  error?: string;
}

export class FileStorageService {
  private config: FileStorageConfig;
  private baseUrl: string;

  constructor(config: FileStorageConfig) {
    this.config = FileStorageConfigSchema.parse(config);
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private getModulePath(module: string): string {
    return path.join(this.config.basePath, module.toLowerCase());
  }

  private async validateFile(file: File): Promise<string | null> {
    if (file.size > this.config.maxFileSize) {
      return `File size exceeds maximum allowed size of ${this.config.maxFileSize / 1024 / 1024}MB`;
    }

    if (!this.config.allowedTypes.some(type => file.type.match(type))) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  }

  private async processImage(buffer: Buffer, mimetype: string): Promise<Buffer> {
    if (!this.config.compression) return buffer;

    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Optimize based on image type
    switch (mimetype) {
      case 'image/jpeg':
        return image.jpeg({ quality: 80 }).toBuffer();
      case 'image/png':
        return image.png({ quality: 80 }).toBuffer();
      case 'image/webp':
        return image.webp({ quality: 80 }).toBuffer();
      default:
        return buffer;
    }
  }

  public async uploadFile(
    file: File,
    module: string,
    metadata?: Record<string, unknown>
  ): Promise<UploadResult> {
    try {
      const validationError = await this.validateFile(file);
      if (validationError) {
        return { success: false, error: validationError };
      }

      const modulePath = this.getModulePath(module);
      await this.ensureDirectoryExists(modulePath);

      const fileId = uuidv4();
      const extension = path.extname(file.name);
      const filename = `${fileId}${extension}`;
      const filePath = path.join(modulePath, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      const processedBuffer = await this.processImage(buffer, file.type);
      await fs.writeFile(filePath, processedBuffer);

      const fileMetadata: FileMetadata = {
        id: fileId,
        filename,
        originalName: file.name,
        mimetype: file.type,
        size: processedBuffer.length,
        path: filePath,
        url: `${this.baseUrl}/api/files/${module}/${filename}`,
        module,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata,
      };

      return { success: true, file: fileMetadata };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: 'Failed to upload file' };
    }
  }

  public async deleteFile(module: string, fileId: string): Promise<boolean> {
    try {
      const modulePath = this.getModulePath(module);
      const files = await fs.readdir(modulePath);
      const file = files.find(f => f.startsWith(fileId));

      if (file) {
        await fs.unlink(path.join(modulePath, file));
        return true;
      }
      return false;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  public async getFileMetadata(module: string, fileId: string): Promise<FileMetadata | null> {
    try {
      const modulePath = this.getModulePath(module);
      const files = await fs.readdir(modulePath);
      const file = files.find(f => f.startsWith(fileId));

      if (!file) return null;

      const stats = await fs.stat(path.join(modulePath, file));
      const mimetype = this.getMimeType(file);

      return {
        id: fileId,
        filename: file,
        originalName: file,
        mimetype,
        size: stats.size,
        path: path.join(modulePath, file),
        url: `${this.baseUrl}/api/files/${module}/${file}`,
        module,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
      };
    } catch (error) {
      console.error('Get file metadata error:', error);
      return null;
    }
  }

  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
} 