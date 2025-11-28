import { Router, Request, Response } from 'express';
import { integrationsStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all integrations
router.get('/', async (req: Request, res: Response) => {
  try {
    const integrations = await integrationsStorage.getAll();
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Create integration
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, config } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const newIntegration = {
      id: uuidv4(),
      name,
      type,
      config: config || {},
      status: 'connected', // Default to connected for now
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await integrationsStorage.create(newIntegration);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

// Update integration
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updated = await integrationsStorage.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Delete integration
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await integrationsStorage.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete integration' });
  }
});

export default router;
