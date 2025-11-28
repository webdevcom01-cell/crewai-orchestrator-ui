import { Response } from 'express';

// ============================================
// Type Definitions
// ============================================

interface SSEClient {
  id: string;
  runId: string;
  res: Response;
}

interface SSEEvent {
  type: string;
  data: any;
}

// ============================================
// SSE Service for Real-time Updates
// ============================================

class SSEService {
  private clients: Map<string, SSEClient[]> = new Map();

  /**
   * Add a new SSE client for a specific run
   */
  addClient(runId: string, res: Response): string {
    const clientId = Math.random().toString(36).substring(7);
    
    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Send initial comment to establish connection
    res.write(': connected\n\n');
    
    // Add client to registry
    if (!this.clients.has(runId)) {
      this.clients.set(runId, []);
    }
    
    this.clients.get(runId)!.push({ id: clientId, runId, res });
    
    console.log(`✅ SSE Client ${clientId} connected to run ${runId}`);
    
    // Cleanup on disconnect
    res.on('close', () => {
      this.removeClient(runId, clientId);
      console.log(`❌ SSE Client ${clientId} disconnected from run ${runId}`);
    });
    
    return clientId;
  }

  /**
   * Send event to all clients listening to a specific run
   */
  sendEvent(runId: string, event: SSEEvent): void {
    const clients = this.clients.get(runId);
    if (!clients || clients.length === 0) {
      return;
    }
    
    const message = `data: ${JSON.stringify(event)}\n\n`;
    
    clients.forEach(client => {
      try {
        client.res.write(message);
      } catch (error) {
        console.error(`Failed to send SSE to client ${client.id}:`, error);
      }
    });
  }

  /**
   * Send multiple events at once
   */
  sendEvents(runId: string, events: SSEEvent[]): void {
    events.forEach(event => this.sendEvent(runId, event));
  }

  /**
   * Remove a specific client
   */
  removeClient(runId: string, clientId: string): void {
    const clients = this.clients.get(runId);
    if (!clients) return;
    
    const filtered = clients.filter(c => c.id !== clientId);
    
    if (filtered.length === 0) {
      this.clients.delete(runId);
    } else {
      this.clients.set(runId, filtered);
    }
  }

  /**
   * Close all connections for a specific run
   */
  closeRun(runId: string): void {
    const clients = this.clients.get(runId);
    if (!clients) return;
    
    // Send final event before closing
    this.sendEvent(runId, { type: 'complete', data: {} });
    
    // Close all client connections
    clients.forEach(client => {
      try {
        client.res.end();
      } catch (error) {
        console.error(`Failed to close SSE client ${client.id}:`, error);
      }
    });
    
    this.clients.delete(runId);
    console.log(`🔒 Closed all SSE connections for run ${runId}`);
  }

  /**
   * Get number of active clients for a run
   */
  getClientCount(runId: string): number {
    return this.clients.get(runId)?.length || 0;
  }

  /**
   * Get all active run IDs
   */
  getActiveRuns(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Cleanup all connections
   */
  cleanup(): void {
    const runIds = Array.from(this.clients.keys());
    runIds.forEach(runId => this.closeRun(runId));
    console.log('🧹 SSE Service cleaned up all connections');
  }
}

// Export singleton instance
export const sseService = new SSEService();

// Cleanup on process exit
process.on('SIGTERM', () => sseService.cleanup());
process.on('SIGINT', () => sseService.cleanup());
