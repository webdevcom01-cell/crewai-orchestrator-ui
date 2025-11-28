import { Router, Request, Response } from 'express';
import { apiKeysStorage } from '../storage/fileStorage.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = Router();

// Get all API keys (masked)
router.get('/', async (req: Request, res: Response) => {
  try {
    const keys = await apiKeysStorage.getAll();
    // Mask the actual keys before sending to client
    const maskedKeys = keys.map(k => ({
      ...k,
      key: `${k.key.substring(0, 8)}...`
    }));
    res.json(maskedKeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create API key
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate a random key
    const key = `sk-${crypto.randomBytes(24).toString('hex')}`;

    const newKey = {
      id: uuidv4(),
      name,
      key, // In a real app, we should hash this before storing!
      lastUsed: null,
      createdAt: new Date().toISOString()
    };

    const created = await apiKeysStorage.create(newKey);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Delete API key
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await apiKeysStorage.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

export default router;
