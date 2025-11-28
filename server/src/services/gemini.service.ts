import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config/index.js';
import { 
  GenerateBackstoryRequest, 
  AgentConfig, 
  TaskConfig,
  LogEntry,
  SimulationResult,
  AIServiceError 
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private flashModel: GenerativeModel;
  private proModel: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.flashModel = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    this.proModel = this.genAI.getGenerativeModel({ model: 'gemini-exp-1206' });
  }

  /**
   * Generate agent backstory using Gemini AI
   */
  async generateBackstory(request: GenerateBackstoryRequest): Promise<string> {
    try {
      const prompt = `You are an expert at creating personas for AI agents in a CrewAI multi-agent system.

Role: ${request.role}
Goal: ${request.goal}

Write a concise (2-3 sentences) but professional and motivating backstory for this agent. 
The backstory should:
- Highlight their expertise and experience
- Explain their motivation and drive
- Be written in third person
- Sound professional yet engaging
- Be under ${config.gemini.maxBackstoryLength} characters

Return ONLY the backstory text, no additional formatting or explanations.`;

      const result = await this.flashModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new AIServiceError('Empty response from Gemini API');
      }

      // Trim to max length if necessary
      const backstory = text.trim();
      return backstory.length > config.gemini.maxBackstoryLength
        ? backstory.substring(0, config.gemini.maxBackstoryLength) + '...'
        : backstory;

    } catch (error) {
      console.error('❌ Error generating backstory:', error);
      
      if (error instanceof AIServiceError) {
        throw error;
      }
      
      throw new AIServiceError(
        `Failed to generate backstory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Simulate a crew run using Gemini AI
   */
  async simulateCrewRun(
    agents: AgentConfig[],
    tasks: TaskConfig[],
    processType: string,
    input?: Record<string, any>
  ): Promise<SimulationResult> {
    const startTime = Date.now();
    const runId = uuidv4();

    try {
      const agentsDesc = agents
        .map((a) => `- **${a.role}** (${a.name}): ${a.goal}\n  Tools: ${a.tools.join(', ') || 'None'}\n  Backstory: ${a.backstory}`)
        .join('\n');

      const tasksDesc = tasks
        .map((t, i) => {
          const agent = agents.find((a) => a.id === t.agentId);
          const contextInfo = t.contextTaskIds.length > 0
            ? `\n  Context from tasks: ${t.contextTaskIds.join(', ')}`
            : '';
          return `${i + 1}. **${t.name}**
   Description: ${t.description}
   Expected Output: ${t.expectedOutput}
   Assigned to: ${agent ? agent.role : 'Manager'}${contextInfo}`;
        })
        .join('\n\n');

      const inputDesc = input && Object.keys(input).length > 0
        ? `\n### Input Parameters\n${JSON.stringify(input, null, 2)}`
        : '';

      const prompt = `You are simulating a CrewAI multi-agent system execution. Generate a realistic, detailed execution log.

### Process Type
${processType}

### Agents
${agentsDesc}

### Tasks
${tasksDesc}${inputDesc}

Generate a realistic execution log as a JSON array. Each log entry must have this exact format:
{
  "agent": "Agent Name or System",
  "type": "thought" | "action" | "output" | "error" | "info",
  "content": "The detailed content of the log"
}

Simulation requirements:
1. Show agents thinking through problems (type: "thought")
2. Show tool usage with realistic results (type: "action")  
3. Show intermediate outputs (type: "output")
4. Show task handoffs between agents
5. Include timestamps and realistic delays
6. Make it feel like a real execution with ${tasks.length} tasks
7. Each task should have 3-5 log entries minimum
8. Show context passing between dependent tasks
9. End with a final summary output

Return ONLY the JSON array, no markdown formatting or additional text.`;

      const result = await this.proModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: config.gemini.maxSimulationTokens,
        },
      });

      const response = result.response;
      let text = response.text().trim();

      // Remove markdown code blocks if present
      text = text.replace(/^```json\n?/i, '').replace(/\n?```$/i, '');
      text = text.trim();

      let rawLogs: Array<{ agent: string; type: string; content: string }>;
      try {
        rawLogs = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON:', text.substring(0, 200));
        throw new AIServiceError('Invalid JSON response from AI model', 500);
      }

      if (!Array.isArray(rawLogs)) {
        throw new AIServiceError('AI response is not an array', 500);
      }

      // Transform to LogEntry format with IDs and timestamps
      const logs: LogEntry[] = rawLogs.map((log, index) => ({
        id: uuidv4(),
        timestamp: new Date(startTime + index * 100).toISOString(),
        agent: log.agent || 'System',
        type: (log.type as LogEntry['type']) || 'info',
        content: log.content || '',
      }));

      // Extract final output from last output-type log
      const outputLogs = logs.filter((l) => l.type === 'output');
      const finalOutput = outputLogs.length > 0 
        ? outputLogs[outputLogs.length - 1].content 
        : 'Simulation completed successfully.';

      const duration = Date.now() - startTime;

      return {
        runId,
        status: 'completed',
        logs,
        finalOutput,
        duration,
      };

    } catch (error) {
      console.error('❌ Error simulating crew run:', error);
      
      const duration = Date.now() - startTime;
      
      if (error instanceof AIServiceError) {
        return {
          runId,
          status: 'failed',
          logs: [
            {
              id: uuidv4(),
              timestamp: new Date().toISOString(),
              agent: 'System',
              type: 'error',
              content: error.message,
            },
          ],
          error: error.message,
          duration,
        };
      }

      throw new AIServiceError(
        `Failed to simulate crew run: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  /**
   * Health check for Gemini API connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.flashModel.generateContent('Hello');
      return !!result.response.text();
    } catch (error) {
      console.error('❌ Gemini health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const geminiService = new GeminiService();

// Export convenience functions for direct use
export const generateBackstory = (request: GenerateBackstoryRequest) => 
  geminiService.generateBackstory(request);

export const simulateCrewRun = (
  agents: AgentConfig[],
  tasks: TaskConfig[],
  processType: string,
  input?: Record<string, any>
) => geminiService.simulateCrewRun(agents, tasks, processType, input);

export const checkGeminiHealth = () => geminiService.healthCheck();
