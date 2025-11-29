import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload options for different file types
const UPLOAD_PRESETS = {
  avatar: {
    folder: 'crewai/avatars',
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto:good' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    max_file_size: 5 * 1024 * 1024, // 5MB
  },
  document: {
    folder: 'crewai/documents',
    resource_type: 'raw' as const,
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'md', 'json', 'csv'],
    max_file_size: 20 * 1024 * 1024, // 20MB
  },
  attachment: {
    folder: 'crewai/attachments',
    resource_type: 'auto' as const,
    max_file_size: 50 * 1024 * 1024, // 50MB
  },
};

export type UploadType = keyof typeof UPLOAD_PRESETS;

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  resourceType: string;
  createdAt: Date;
}

export interface UploadOptions {
  type: UploadType;
  filename?: string;
  userId?: string;
  workspaceId?: string;
  tags?: string[];
}

class UploadService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!this.isConfigured) {
      console.warn('[UploadService] Cloudinary not configured. File uploads will not work.');
    }
  }

  // ============================================
  // Upload Methods
  // ============================================

  /**
   * Upload a file buffer
   */
  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    const preset = UPLOAD_PRESETS[options.type];

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: preset.folder,
          resource_type: (preset as any).resource_type || 'auto',
          transformation: (preset as any).transformation,
          allowed_formats: (preset as any).allowed_formats,
          public_id: options.filename ? this.sanitizeFilename(options.filename) : undefined,
          tags: [
            ...(options.tags || []),
            options.userId ? `user:${options.userId}` : '',
            options.workspaceId ? `workspace:${options.workspaceId}` : '',
          ].filter(Boolean),
          context: {
            userId: options.userId || '',
            workspaceId: options.workspaceId || '',
          },
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('[UploadService] Upload error:', error);
            reject(new Error(error.message));
          } else if (result) {
            resolve(this.formatResult(result));
          } else {
            reject(new Error('Upload failed without error'));
          }
        }
      );

      // Convert buffer to stream and pipe to cloudinary
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload a file from URL
   */
  async uploadFromUrl(
    url: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    const preset = UPLOAD_PRESETS[options.type];

    try {
      const result = await cloudinary.uploader.upload(url, {
        folder: preset.folder,
        resource_type: (preset as any).resource_type || 'auto',
        transformation: (preset as any).transformation,
        allowed_formats: (preset as any).allowed_formats,
        public_id: options.filename ? this.sanitizeFilename(options.filename) : undefined,
        tags: [
          ...(options.tags || []),
          options.userId ? `user:${options.userId}` : '',
          options.workspaceId ? `workspace:${options.workspaceId}` : '',
        ].filter(Boolean),
      });

      return this.formatResult(result);
    } catch (error: any) {
      console.error('[UploadService] Upload from URL error:', error);
      throw new Error(error.message || 'Failed to upload from URL');
    }
  }

  /**
   * Upload base64 encoded data
   */
  async uploadBase64(
    base64Data: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    const preset = UPLOAD_PRESETS[options.type];

    try {
      // Ensure data URI prefix
      const dataUri = base64Data.startsWith('data:')
        ? base64Data
        : `data:application/octet-stream;base64,${base64Data}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: preset.folder,
        resource_type: (preset as any).resource_type || 'auto',
        transformation: (preset as any).transformation,
        public_id: options.filename ? this.sanitizeFilename(options.filename) : undefined,
        tags: options.tags,
      });

      return this.formatResult(result);
    } catch (error: any) {
      console.error('[UploadService] Base64 upload error:', error);
      throw new Error(error.message || 'Failed to upload base64 data');
    }
  }

  // ============================================
  // Delete Methods
  // ============================================

  /**
   * Delete a file by public ID
   */
  async delete(publicId: string, resourceType: string = 'image'): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType as any,
      });
      return result.result === 'ok';
    } catch (error: any) {
      console.error('[UploadService] Delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMany(publicIds: string[], resourceType: string = 'image'): Promise<number> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType as any,
      });
      return Object.values(result.deleted).filter((v) => v === 'deleted').length;
    } catch (error: any) {
      console.error('[UploadService] Bulk delete error:', error);
      return 0;
    }
  }

  // ============================================
  // URL Generation
  // ============================================

  /**
   * Generate a transformed URL
   */
  getUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          width: options.width,
          height: options.height,
          crop: options.crop || 'fill',
          quality: options.quality || 'auto',
          fetch_format: options.format || 'auto',
        },
      ],
    });
  }

  /**
   * Generate a signed URL with expiration
   */
  getSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
    const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;

    return cloudinary.url(publicId, {
      secure: true,
      sign_url: true,
      type: 'authenticated',
      expires_at: expiration,
    });
  }

  /**
   * Get avatar URL with fallback
   */
  getAvatarUrl(publicId: string | null | undefined, size: number = 100): string {
    if (!publicId) {
      // Return a default avatar placeholder
      return `https://ui-avatars.com/api/?size=${size}&background=667eea&color=ffffff&name=U`;
    }

    return this.getUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
    });
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate file size
   */
  validateFileSize(bytes: number, type: UploadType): boolean {
    const preset = UPLOAD_PRESETS[type];
    return bytes <= preset.max_file_size;
  }

  /**
   * Get max file size for type
   */
  getMaxFileSize(type: UploadType): number {
    return UPLOAD_PRESETS[type].max_file_size;
  }

  /**
   * Sanitize filename for use as public ID
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 100);
  }

  /**
   * Format upload result
   */
  private formatResult(result: UploadApiResponse): UploadResult {
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      resourceType: result.resource_type,
      createdAt: new Date(result.created_at),
    };
  }
}

export const uploadService = new UploadService();
export default uploadService;
