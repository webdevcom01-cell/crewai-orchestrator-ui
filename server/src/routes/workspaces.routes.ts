import { Router, Request, Response, NextFunction } from 'express';
import { workspacesStorage, membersStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation.js';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member', 'viewer']),
});

// ============================================
// Routes
// ============================================

/**
 * GET /api/workspaces/:id
 * Get workspace details
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For now, return a mock workspace if it doesn't exist
    let workspace = await workspacesStorage.getById(req.params.id);
    
    if (!workspace) {
      workspace = {
        id: req.params.id,
        name: 'Default Workspace',
        plan: 'pro',
        createdAt: new Date().toISOString()
      };
      await workspacesStorage.create(workspace);
    }
    
    res.json({ 
      success: true, 
      data: workspace 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workspaces/:id/members
 * Get workspace members
 */
router.get('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allMembers = await membersStorage.getAll();
    const workspaceMembers = allMembers.filter((m: any) => m.workspaceId === req.params.id);
    
    // If empty, add current user as owner (mock)
    if (workspaceMembers.length === 0) {
      const owner = {
        id: uuidv4(),
        workspaceId: req.params.id,
        userId: 'admin_001',
        role: 'owner',
        user: {
          id: 'admin_001',
          name: 'Admin User',
          email: 'admin@crewai.local',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User'
        },
        joinedAt: new Date().toISOString()
      };
      await membersStorage.create(owner);
      workspaceMembers.push(owner);
    }

    res.json({ 
      success: true, 
      data: workspaceMembers 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/workspaces/:id/invite
 * Invite member
 */
router.post('/:id/invite', validateRequest(InviteMemberSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role } = req.body;
    
    const newMember = {
      id: uuidv4(),
      workspaceId: req.params.id,
      role,
      status: 'invited',
      email, // Store email for invited users
      invitedAt: new Date().toISOString(),
      user: {
        name: email.split('@')[0],
        email,
        avatar: `https://ui-avatars.com/api/?name=${email}`
      }
    };
    
    await membersStorage.create(newMember);
    
    res.json({ 
      success: true, 
      data: newMember,
      message: `Invitation sent to ${email}`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/workspaces/:id/analytics
 * Mock analytics data
 */
router.get('/:id/analytics', async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    data: {
      totalRuns: 145,
      successRate: 92,
      avgDuration: '4m 12s',
      activeAgents: 8,
      runsHistory: [
        { date: '2024-01-01', runs: 12 },
        { date: '2024-01-02', runs: 19 },
        { date: '2024-01-03', runs: 15 },
        { date: '2024-01-04', runs: 22 },
        { date: '2024-01-05', runs: 28 },
        { date: '2024-01-06', runs: 24 },
        { date: '2024-01-07', runs: 25 },
      ],
      topAgents: [
        { name: 'Research Agent', runs: 45, successRate: 98 },
        { name: 'Writer Agent', runs: 38, successRate: 95 },
        { name: 'Reviewer Agent', runs: 32, successRate: 88 },
      ]
    }
  });
});

/**
 * GET /api/workspaces/:id/subscription
 * Mock subscription data
 */
router.get('/:id/subscription', async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    data: {
      plan: 'pro',
      status: 'active',
      nextBillingDate: '2024-03-01',
      amount: 2900,
      currency: 'usd'
    }
  });
});

/**
 * GET /api/workspaces/:id/usage
 * Mock usage data
 */
router.get('/:id/usage', async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    success: true,
    data: {
      runs: { used: 145, limit: 1000 },
      agents: { used: 8, limit: 20 },
      seats: { used: 3, limit: 5 }
    }
  });
});

export default router;
