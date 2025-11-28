import { Router, Request, Response } from 'express';
import { schedulesStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all schedules
router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await schedulesStorage.getAll();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Create schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const { flowId, cronExpression, name } = req.body;
    
    if (!flowId || !cronExpression) {
      return res.status(400).json({ error: 'Flow ID and Cron Expression are required' });
    }

    const newSchedule = {
      id: uuidv4(),
      name: name || 'Untitled Schedule',
      flowId,
      cronExpression,
      isActive: true,
      lastRun: null,
      nextRun: null, // In a real app, we'd calculate this
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await schedulesStorage.create(newSchedule);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = await schedulesStorage.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete schedule
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await schedulesStorage.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default router;
