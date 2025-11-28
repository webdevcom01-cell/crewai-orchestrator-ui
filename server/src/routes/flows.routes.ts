import { Router, Request, Response, NextFunction } from 'express';
import { flowsStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const FlowCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().default(''),
  processType: z.enum(['sequential', 'hierarchical', 'parallel']).default('sequential'),
  agentIds: z.array(z.string()).min(1, 'At least one agent is required'),
  taskIds: z.array(z.string()).min(1, 'At least one task is required'),
});

const FlowUpdateSchema = FlowCreateSchema.partial();

// ============================================
// Type Definitions
// ============================================

interface Flow {
  id: string;
  name: string;
  description: string;
  processType: 'sequential' | 'hierarchical' | 'parallel';
  agentIds: string[];
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Routes
// ============================================

/**
 * GET /api/flows
 * Get all flows
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flows = await flowsStorage.getAll();
    res.json({ 
      success: true, 
      data: flows 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/flows/:id
 * Get flow by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flow = await flowsStorage.getById(req.params.id);
    
    if (!flow) {
      return res.status(404).json({ 
        success: false, 
        error: 'Flow not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: flow 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/flows
 * Create new flow
 */
router.post('/', validateRequest(FlowCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flow: Flow = {
      id: req.body.id || uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await flowsStorage.create(flow);
    
    res.status(201).json({ 
      success: true, 
      data: flow 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/flows/:id
 * Update existing flow
 */
router.put('/:id', validateRequest(FlowUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await flowsStorage.update(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Flow not found' 
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
 * DELETE /api/flows/:id
 * Delete flow
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await flowsStorage.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Flow not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Flow deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
