import { GoogleGenAI } from "@google/genai";
import { Agent, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAgentBackstory = async (role: string, goal: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert at creating personas for AI agents in a CrewAI system.
      
      Role: ${role}
      Goal: ${goal}
      
      Write a concise (2-3 sentences) but professional and motivating backstory for this agent. Focus on their expertise and motivation.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating backstory:", error);
    return "Expert agent dedicated to accomplishing assigned tasks with high precision.";
  }
};

export const simulateCrewRun = async (
  agents: Agent[], 
  tasks: Task[], 
  processType: string
): Promise<string> => {
  const agentsDesc = agents.map(a => `- **${a.role}**: ${a.goal}. Backstory: ${a.backstory}`).join('\n');
  const tasksDesc = tasks.map((t, i) => {
    const agent = agents.find(a => a.id === t.agentId);
    return `${i + 1}. **Task**: ${t.description}\n   **Expected Output**: ${t.expectedOutput}\n   **Assigned to**: ${agent ? agent.role : 'Manager'}`;
  }).join('\n');

  const prompt = `Simulate a CrewAI execution for the following configuration.
  
  ### Agents
  ${agentsDesc}
  
  ### Tasks
  ${tasksDesc}
  
  ### Process
  ${processType}
  
  Generate a realistic execution log. Format it as a JSON array where each item is:
  {
    "agent": "Name of agent or System",
    "type": "thought" | "action" | "output",
    "content": "The content of the log"
  }
  
  Ensure the simulation shows agents thinking, using tools (simulate tool usage), and handing off work. Be detailed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return response.text || "[]";
  } catch (error) {
    console.error("Error simulating run:", error);
    throw error;
  }
};