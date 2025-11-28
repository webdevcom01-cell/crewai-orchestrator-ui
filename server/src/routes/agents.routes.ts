import { Router, Request, Response, NextFunction } from 'express';
import { agentsStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const AgentCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.string().min(1, 'Role is required').max(200, 'Role too long'),
  goal: z.string().min(1, 'Goal is required').max(1000, 'Goal too long'),
  backstory: z.string().max(2000, 'Backstory too long').optional().default(''),
  model: z.string().optional().default('gemini-pro'),
  tools: z.array(z.string()).optional().default([]),
  allowDelegation: z.boolean().optional().default(false),
  verbose: z.boolean().optional().default(false),
});

const AgentUpdateSchema = AgentCreateSchema.partial();

// ============================================
// Type Definitions
// ============================================

interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  model: string;
  tools: string[];
  allowDelegation: boolean;
  verbose: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Routes
// ============================================

/**
 * GET /api/agents
 * Get all agents
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agents = await agentsStorage.getAll();
    res.json({ 
      success: true, 
      data: agents 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/agents/:id
 * Get agent by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent = await agentsStorage.getById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agent not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: agent 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/agents
 * Create new agent
 */
router.post('/', validateRequest(AgentCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agent: Agent = {
      id: req.body.id || uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await agentsStorage.create(agent);
    
    res.status(201).json({ 
      success: true, 
      data: agent 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/agents/:id
 * Update existing agent
 */
router.put('/:id', validateRequest(AgentUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await agentsStorage.update(req.params.id, {
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agent not found' 
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
 * DELETE /api/agents/:id
 * Delete agent
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await agentsStorage.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Agent not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Agent deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
});

export default router;
