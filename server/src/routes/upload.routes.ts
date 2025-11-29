import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadService, UploadType } from '../services/upload.service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept all files, validation happens in the service
    cb(null, true);
  },
});

// ============================================
// Upload Avatar
// ============================================

router.post(
  '/avatar',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      const user = req.user!;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      // Validate file size
      if (!uploadService.validateFileSize(file.size, 'avatar')) {
        const maxSize = uploadService.getMaxFileSize('avatar') / 1024 / 1024;
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${maxSize}MB`,
        });
      }

      const result = await uploadService.uploadBuffer(file.buffer, {
        type: 'avatar',
        filename: `avatar_${user.id}`,
        userId: user.id,
      });

      res.json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Upload Document
// ============================================

router.post(
  '/document',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      const user = req.user!;
      const { workspaceId } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      if (!uploadService.validateFileSize(file.size, 'document')) {
        const maxSize = uploadService.getMaxFileSize('document') / 1024 / 1024;
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${maxSize}MB`,
        });
      }

      const result = await uploadService.uploadBuffer(file.buffer, {
        type: 'document',
        filename: file.originalname,
        userId: user.id,
        workspaceId,
      });

      res.json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          filename: file.originalname,
          size: result.bytes,
          format: result.format,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Upload Generic Attachment
// ============================================

router.post(
  '/attachment',
  authenticate,
  upload.single('file'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      const user = req.user!;
      const { workspaceId, taskId, runId } = req.body;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      if (!uploadService.validateFileSize(file.size, 'attachment')) {
        const maxSize = uploadService.getMaxFileSize('attachment') / 1024 / 1024;
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${maxSize}MB`,
        });
      }

      const tags: string[] = [];
      if (taskId) tags.push(`task:${taskId}`);
      if (runId) tags.push(`run:${runId}`);

      const result = await uploadService.uploadBuffer(file.buffer, {
        type: 'attachment',
        filename: file.originalname,
        userId: user.id,
        workspaceId,
        tags,
      });

      res.json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          filename: file.originalname,
          size: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height,
          resourceType: result.resourceType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Upload Multiple Files
// ============================================

router.post(
  '/multiple',
  authenticate,
  upload.array('files', 10), // Max 10 files
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      const user = req.user!;
      const { workspaceId, type = 'attachment' } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files provided',
        });
      }

      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const result = await uploadService.uploadBuffer(file.buffer, {
              type: type as UploadType,
              filename: file.originalname,
              userId: user.id,
              workspaceId,
            });

            return {
              success: true,
              filename: file.originalname,
              url: result.secureUrl,
              publicId: result.publicId,
              size: result.bytes,
            };
          } catch (error: any) {
            return {
              success: false,
              filename: file.originalname,
              error: error.message,
            };
          }
        })
      );

      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      res.json({
        success: true,
        data: {
          uploaded: successful.length,
          failed: failed.length,
          files: results,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Upload from URL
// ============================================

router.post(
  '/from-url',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { url, type = 'attachment', workspaceId, filename } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          error: 'URL is required',
        });
      }

      const result = await uploadService.uploadFromUrl(url, {
        type: type as UploadType,
        filename,
        userId: user.id,
        workspaceId,
      });

      res.json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          size: result.bytes,
          format: result.format,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Delete File
// ============================================

router.delete(
  '/:publicId',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { publicId } = req.params;
      const { resourceType = 'image' } = req.query;

      const deleted = await uploadService.delete(publicId, resourceType as string);

      if (deleted) {
        res.json({
          success: true,
          message: 'File deleted successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'File not found or could not be deleted',
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// Get Signed URL
// ============================================

router.post(
  '/signed-url',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { publicId, expiresIn = 3600 } = req.body;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          error: 'Public ID is required',
        });
      }

      const signedUrl = uploadService.getSignedUrl(publicId, expiresIn);

      res.json({
        success: true,
        data: {
          url: signedUrl,
          expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
