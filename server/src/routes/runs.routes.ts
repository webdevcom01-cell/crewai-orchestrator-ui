import { Router, Request, Response, NextFunction } from 'express';
import { runsStorage, flowsStorage, agentsStorage, tasksStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';
import { sseService } from '../services/sse.service.js';
import { simulateCrewRun } from '../services/gemini.service.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const StartRunSchema = z.object({
  input: z.record(z.any()).optional().default({}),
});

// ============================================
// Type Definitions
// ============================================

interface Run {
  id: string;
  flowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, any>;
  output?: any;
  error?: string;
  logs: LogEntry[];
  startedAt: string;
  completedAt?: string;
  duration?: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: 'thought' | 'action' | 'output' | 'error' | 'info';
  content: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Execute a crew run with real-time SSE updates
 */
async function executeRun(run: Run): Promise<void> {
  try {
    // Update run status to running
    run.status = 'running';
    await runsStorage.update(run.id, run);
    
    // Send status update via SSE
    sseService.sendEvent(run.id, {
      type: 'status',
      data: { status: 'running' }
    });

    // Get flow details
    const flow = await flowsStorage.getById(run.flowId);
    if (!flow) {
      throw new Error('Flow not found');
    }

    // Get agents and tasks
    const agents = await Promise.all(
      flow.agentIds.map(id => agentsStorage.getById(id))
    );
    
    const tasks = await Promise.all(
      flow.taskIds.map(id => tasksStorage.getById(id))
    );

    // Filter out any undefined values
    const validAgents = agents.filter(a => a !== undefined);
    const validTasks = tasks.filter(t => t !== undefined);

    if (validAgents.length === 0 || validTasks.length === 0) {
      throw new Error('No valid agents or tasks found');
    }

    // Send progress update
    sseService.sendEvent(run.id, {
      type: 'log',
      data: {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        agent: 'System',
        type: 'info',
        content: `Starting ${flow.processType} workflow with ${validAgents.length} agents and ${validTasks.length} tasks...`
      }
    });

    // Simulate the crew run using Gemini
    const result = await simulateCrewRun({
      agents: validAgents as any,
      tasks: validTasks as any,
      processType: flow.processType,
      input: run.input
    });

    // Send logs via SSE
    result.logs.forEach(log => {
      sseService.sendEvent(run.id, {
        type: 'log',
        data: log
      });
    });

    // Update run with results
    run.status = result.status;
    run.output = result.finalOutput;
    run.logs = result.logs;
    run.completedAt = new Date().toISOString();
    run.duration = result.duration;

    await runsStorage.update(run.id, run);

    // Send completion event
    sseService.sendEvent(run.id, {
      type: 'complete',
      data: {
        status: result.status,
        output: result.finalOutput,
        duration: result.duration
      }
    });

  } catch (error: any) {
    // Handle errors
    run.status = 'failed';
    run.error = error.message || 'Unknown error';
    run.completedAt = new Date().toISOString();
    run.duration = Date.now() - new Date(run.startedAt).getTime();

    await runsStorage.update(run.id, run);

    // Send error via SSE
    sseService.sendEvent(run.id, {
      type: 'error',
      data: {
        error: run.error
      }
    });
  } finally {
    // Close SSE connections after a delay
    setTimeout(() => {
      sseService.closeRun(run.id);
    }, 1000);
  }
}

// ============================================
// Routes
// ============================================

/**
 * POST /api/flows/:flowId/runs
 * Start a new run for a flow
 */
router.post('/:flowId/runs', validateRequest(StartRunSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flowId } = req.params;
    
    // Check if flow exists
    const flow = await flowsStorage.getById(flowId);
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }

    // Create new run
    const run: Run = {
      id: uuidv4(),
      flowId,
      status: 'pending',
      input: req.body.input || {},
      logs: [],
      startedAt: new Date().toISOString(),
    };

    await runsStorage.create(run);

    // Start execution asynchronously
    executeRun(run).catch(error => {
      console.error('Run execution failed:', error);
    });

    // Return immediately with run ID
    res.status(201).json({
      success: true,
      data: run
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/flows/:flowId/runs
 * Get all runs for a flow
 */
router.get('/:flowId/runs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flowId } = req.params;
    const allRuns = await runsStorage.getAll();
    const flowRuns = allRuns.filter(run => run.flowId === flowId);
    
    res.json({
      success: true,
      data: flowRuns
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/runs/:id
 * Get run by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await runsStorage.getById(req.params.id);
    
    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found'
      });
    }

    res.json({
      success: true,
      data: run
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/runs/:id/events
 * Subscribe to real-time SSE events for a run
 */
router.get('/:id/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const run = await runsStorage.getById(req.params.id);
    
    if (!run) {
      return res.status(404).json({
        success: false,
        error: 'Run not found'
      });
    }

    // Setup SSE connection
    const clientId = sseService.addClient(req.params.id, res);

    // Send initial state
    sseService.sendEvent(req.params.id, {
      type: 'init',
      data: run
    });

    // If run is already completed, send complete event
    if (run.status === 'completed' || run.status === 'failed') {
      setTimeout(() => {
        sseService.sendEvent(req.params.id, {
          type: 'complete',
          data: {
            status: run.status,
            output: run.output,
            error: run.error
          }
        });
      }, 100);
    }

  } catch (error) {
    next(error);
  }
});

export default router;
