import { Router, Request, Response, NextFunction } from 'express';
import { tasksStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const TaskCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  expectedOutput: z.string().min(1, 'Expected output is required').max(1000, 'Expected output too long'),
  agentId: z.string().min(1, 'Agent ID is required'),
  contextTaskIds: z.array(z.string()).optional().default([]),
  isEntrypoint: z.boolean().optional().default(false),
});

const TaskUpdateSchema = TaskCreateSchema.partial();

// ============================================
// Type Definitions
// ============================================

interface Task {
  id: string;
  name: string;
  description: string;
  expectedOutput: string;
  agentId: string;
  contextTaskIds: string[];
  isEntrypoint: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Routes
// ============================================

/**
 * GET /api/tasks
 * Get all tasks
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await tasksStorage.getAll();
    res.json({ 
      success: true, 
      data: tasks 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await tasksStorage.getById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: task 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tasks
 * Create new task
 */
router.post('/', validateRequest(TaskCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task: Task = {
      id: req.body.id || uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await tasksStorage.create(task);
    
    res.status(201).json({ 
      success: true, 
      data: task 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tasks/:id
 * Update existing task
 */
router.put('/:id', validateRequest(TaskUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await tasksStorage.update(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: updated 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete task
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await tasksStorage.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Task not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
