import React, { createContext, Dispatch } from 'react';
import {
  AgentConfig,
  TaskConfig,
  FlowConfig,
  OrchestratorState,
  FlowRun,
  FlowRunStatus,
  TaskRunInfo,
} from './types';

// Action type constants to avoid magic strings
export const ACTION_TYPES = {
  INIT_DATA: 'INIT_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_AGENT: 'ADD_AGENT',
  UPDATE_AGENT: 'UPDATE_AGENT',
  DELETE_AGENT: 'DELETE_AGENT',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  ADD_FLOW: 'ADD_FLOW',
  UPDATE_FLOW: 'UPDATE_FLOW',
  DELETE_FLOW: 'DELETE_FLOW',
  SET_SELECTED_AGENT: 'SET_SELECTED_AGENT',
  SET_SELECTED_FLOW: 'SET_SELECTED_FLOW',
  START_RUN: 'START_RUN',
  UPDATE_RUN_STATUS: 'UPDATE_RUN_STATUS',
  UPDATE_TASK_RUN: 'UPDATE_TASK_RUN',
  SET_SELECTED_RUN: 'SET_SELECTED_RUN',
} as const;

export type OrchestratorAction =
  | { type: typeof ACTION_TYPES.INIT_DATA; payload: { agents: AgentConfig[]; tasks: TaskConfig[]; flows: FlowConfig[] } }
  | { type: typeof ACTION_TYPES.SET_LOADING; payload: boolean }
  | { type: typeof ACTION_TYPES.SET_ERROR; payload: string | null }
  | { type: typeof ACTION_TYPES.ADD_AGENT; payload: AgentConfig }
  | { type: typeof ACTION_TYPES.UPDATE_AGENT; payload: AgentConfig }
  | { type: typeof ACTION_TYPES.DELETE_AGENT; payload: { id: string } }
  | { type: typeof ACTION_TYPES.ADD_TASK; payload: TaskConfig }
  | { type: typeof ACTION_TYPES.UPDATE_TASK; payload: TaskConfig }
  | { type: typeof ACTION_TYPES.DELETE_TASK; payload: { id: string } }
  | { type: typeof ACTION_TYPES.ADD_FLOW; payload: FlowConfig }
  | { type: typeof ACTION_TYPES.UPDATE_FLOW; payload: FlowConfig }
  | { type: typeof ACTION_TYPES.DELETE_FLOW; payload: { id: string } }
  | { type: typeof ACTION_TYPES.SET_SELECTED_AGENT; payload?: string }
  | { type: typeof ACTION_TYPES.SET_SELECTED_FLOW; payload?: string }
  | { type: typeof ACTION_TYPES.START_RUN; payload: FlowRun }
  | {
      type: typeof ACTION_TYPES.UPDATE_RUN_STATUS;
      payload: { runId: string; status: FlowRunStatus };
    }
  | {
      type: typeof ACTION_TYPES.UPDATE_TASK_RUN;
      payload: { runId: string; taskRun: TaskRunInfo };
    }
  | { type: typeof ACTION_TYPES.SET_SELECTED_RUN; payload?: string };

export const initialOrchestratorState: OrchestratorState = {
  agents: [],
  tasks: [],
  flows: [],
  runs: [],
  selectedAgentId: undefined,
  selectedFlowId: undefined,
  selectedRunId: undefined,
  isLoading: false,
  error: null,
};

function upsertTaskRun(existing: TaskRunInfo[], next: TaskRunInfo): TaskRunInfo[] {
  const idx = existing.findIndex(tr => tr.taskId === next.taskId);
  if (idx === -1) return [...existing, next];
  const copy = [...existing];
  copy[idx] = { ...copy[idx], ...next };
  return copy;
}

export function orchestratorReducer(
  state: OrchestratorState,
  action: OrchestratorAction,
): OrchestratorState {
  switch (action.type) {
    // Batch action - single re-render for all initial data
    case 'INIT_DATA':
      return {
        ...state,
        agents: action.payload.agents,
        tasks: action.payload.tasks,
        flows: action.payload.flows,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_AGENT':
      return { ...state, agents: [...state.agents, action.payload] };
    case 'UPDATE_AGENT':
      return {
        ...state,
        agents: state.agents.map(a =>
          a.id === action.payload.id ? action.payload : a,
        ),
      };
    case 'DELETE_AGENT':
      return {
        ...state,
        agents: state.agents.filter(a => a.id !== action.payload.id),
        tasks: state.tasks.map(t =>
          t.agentId === action.payload.id ? { ...t, agentId: '' } : t,
        ),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? action.payload : t,
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        // skini ga iz contextTaskIds drugih taskova
        tasks: state.tasks
          .filter(t => t.id !== action.payload.id)
          .map(t => ({
            ...t,
            contextTaskIds: t.contextTaskIds.filter(
              id => id !== action.payload.id,
            ),
          })),
      };
    case 'ADD_FLOW':
      return { ...state, flows: [...state.flows, action.payload] };
    case 'UPDATE_FLOW':
      return {
        ...state,
        flows: state.flows.map(f =>
          f.id === action.payload.id ? action.payload : f,
        ),
      };
    case 'DELETE_FLOW':
      return {
        ...state,
        flows: state.flows.filter(f => f.id !== action.payload.id),
      };
    case 'SET_SELECTED_AGENT':
      return { ...state, selectedAgentId: action.payload };
    case 'SET_SELECTED_FLOW':
      return { ...state, selectedFlowId: action.payload };
    case 'START_RUN':
      return {
        ...state,
        runs: [...state.runs, action.payload],
        selectedRunId: action.payload.id,
      };
    case 'UPDATE_RUN_STATUS':
      return {
        ...state,
        runs: state.runs.map(r =>
          r.id === action.payload.runId
            ? {
                ...r,
                status: action.payload.status,
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
      };
    case 'UPDATE_TASK_RUN':
      return {
        ...state,
        runs: state.runs.map(r =>
          r.id === action.payload.runId
            ? {
                ...r,
                taskRuns: upsertTaskRun(r.taskRuns, action.payload.taskRun),
                updatedAt: new Date().toISOString(),
              }
            : r,
        ),
      };
    case 'SET_SELECTED_RUN':
      return { ...state, selectedRunId: action.payload };
    default:
      return state;
  }
}

export const OrchestratorContext = createContext<{
  state: OrchestratorState;
  dispatch: Dispatch<OrchestratorAction>;
} | null>(null);
