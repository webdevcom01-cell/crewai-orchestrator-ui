import { Router, Request, Response, NextFunction } from 'express';
import { geminiService } from '../services/gemini.service.js';
import { validateBody } from '../middleware/validation.js';
import {
  generateBackstorySchema,
  simulateRunSchema,
  ApiResponse,
  GenerateBackstoryRequest,
  SimulateRunRequest,
} from '../types/index.js';

const router = Router();

/**
 * POST /api/ai/generate-backstory
 * Generate agent backstory using Gemini AI
 */
router.post(
  '/generate-backstory',
  validateBody(generateBackstorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, goal } = req.body as GenerateBackstoryRequest;
      
      console.log(`📝 Generating backstory for role: ${role}`);
      
      const backstory = await geminiService.generateBackstory({ role, goal });
      
      const response: ApiResponse<{ backstory: string }> = {
        success: true,
        data: { backstory },
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/ai/simulate-run
 * Simulate crew run using Gemini AI
 */
router.post(
  '/simulate-run',
  validateBody(simulateRunSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { agents, tasks, processType, input } = req.body as SimulateRunRequest;
      
      console.log(`🚀 Simulating crew run: ${processType} process with ${agents.length} agents and ${tasks.length} tasks`);
      
      const result = await geminiService.simulateCrewRun(agents, tasks, processType, input);
      
      const response: ApiResponse = {
        success: true,
        data: result,
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/ai/health
 * Check Gemini API health
 */
router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const isHealthy = await geminiService.healthCheck();
    
    const response: ApiResponse<{ status: string; gemini: boolean }> = {
      success: isHealthy,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        gemini: isHealthy,
      },
    };
    
    res.status(isHealthy ? 200 : 503).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
