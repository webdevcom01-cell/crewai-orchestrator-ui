import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

ensureDataDir();

/**
 * Generic file-based storage for persisting data in JSON files
 * Provides CRUD operations with in-memory caching
 */
export class FileStorage<T extends { id: string }> {
  private filePath: string;
  private cache: T[] | null = null;

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
  }

  /**
   * Get all items from storage
   */
  async getAll(): Promise<T[]> {
    if (this.cache) {
      return [...this.cache]; // Return copy to prevent mutations
    }
    
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      this.cache = JSON.parse(data);
      return [...this.cache];
    } catch (error) {
      // File doesn't exist, initialize with empty array
      this.cache = [];
      await this.saveAll(this.cache);
      return [];
    }
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<T | undefined> {
    const items = await this.getAll();
    return items.find(item => item.id === id);
  }

  /**
   * Create new item
   */
  async create(item: T): Promise<T> {
    const items = await this.getAll();
    items.push(item);
    await this.saveAll(items);
    return item;
  }

  /**
   * Update existing item
   */
  async update(id: string, updates: Partial<T>): Promise<T | undefined> {
    const items = await this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return undefined;
    }
    
    items[index] = { ...items[index], ...updates };
    await this.saveAll(items);
    return items[index];
  }

  /**
   * Delete item by ID
   */
  async delete(id: string): Promise<boolean> {
    const items = await this.getAll();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length === items.length) {
      return false; // Item not found
    }
    
    await this.saveAll(filtered);
    return true;
  }

  /**
   * Clear cache to force reload from file
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Save all items to file
   */
  private async saveAll(items: T[]): Promise<void> {
    this.cache = items;
    await fs.writeFile(
      this.filePath, 
      JSON.stringify(items, null, 2), 
      'utf-8'
    );
  }
}

// Export storage instances
export const agentsStorage = new FileStorage('agents.json');
export const tasksStorage = new FileStorage('tasks.json');
export const flowsStorage = new FileStorage('flows.json');
export const runsStorage = new FileStorage('runs.json');
export const workspacesStorage = new FileStorage('workspaces.json');
export const membersStorage = new FileStorage('members.json');
export const integrationsStorage = new FileStorage('integrations.json');
export const schedulesStorage = new FileStorage('schedules.json');
export const apiKeysStorage = new FileStorage('api_keys.json');

