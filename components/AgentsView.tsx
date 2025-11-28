import React, { useState, useCallback } from 'react';
import { AgentConfig, AVAILABLE_MODELS } from '../types';
import { Bot } from 'lucide-react';
import { apiAgents } from '../services/api';
import { ACTION_TYPES } from '../reducer';
import { useOrchestrator } from '../hooks';
import AgentList from './AgentList';
import AgentForm from './AgentForm';
import { useToast } from './ui/Toast';
import Modal from './ui/Modal';
import { generateIdFromName, generateTempId, isTempId } from '../utils/helpers';

const AgentsView: React.FC = () => {
  const { state, dispatch } = useOrchestrator();
  const { agents } = state;

  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<string | null>(null);
  
  // Empty state for new agent
  const emptyAgent: AgentConfig = {
    id: '',
    name: '',
    role: '',
    goal: '',
    backstory: '',
    allowDelegation: false,
    verbose: true,
    tools: [],
    model: AVAILABLE_MODELS[0],
  };

  // We need to keep track of the agent being edited.
  // If editingId is null, we are not editing.
  // If editingId is set, we find the agent in the list.
  // If it's a new agent (not in list yet), we need a way to represent that.
  // Let's use a separate state for "new agent mode" or just use a special ID.
  
  const [newAgentData, setNewAgentData] = useState<AgentConfig | null>(null);

  const currentAgent = editingId 
    ? agents.find(a => a.id === editingId) 
    : newAgentData;

  const handleCreate = useCallback(() => {
    const newId = generateTempId('new_agent');
    const newAgent = { ...emptyAgent, id: newId, name: 'NewAgent' };
    setNewAgentData(newAgent);
    setEditingId(newId);
  }, []);

  const handleEdit = useCallback((agent: AgentConfig) => {
    setNewAgentData(null); // Clear new agent data if we switch to existing
    setEditingId(agent.id);
  }, []);

  const handleSave = useCallback(async (formData: AgentConfig) => {
    // Update ID based on name if it's a new agent
    const isNew = isTempId(formData.id, 'new_agent');
    const finalId = isNew ? generateIdFromName(formData.name) : formData.id;
    
    const agentData = {
      ...formData,
      id: finalId
    };
    
    try {
      if (isNew) {
        const createdAgent = await apiAgents.create(agentData); 
        dispatch({ type: ACTION_TYPES.ADD_AGENT, payload: createdAgent });
        setEditingId(null);
        setNewAgentData(null);
        showToast({ type: 'success', title: 'Agent Created', message: `Agent ${createdAgent.name} created successfully.` });
      } else {
        // Update
        const updatedAgent = await apiAgents.update(editingId!, agentData);
        dispatch({ type: ACTION_TYPES.UPDATE_AGENT, payload: updatedAgent });
        setEditingId(null);
        showToast({ type: 'success', title: 'Agent Updated', message: `Agent ${updatedAgent.name} updated successfully.` });
      }
    } catch (error) {
      console.error("Failed to save agent:", error);
      const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
      showToast({ 
        type: 'error', 
        title: 'Save Failed', 
        message: errorMessage 
      });
    }
  }, [dispatch, editingId, showToast]);

  const confirmDelete = useCallback((id: string) => {
    setAgentToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!agentToDelete) return;
    const id = agentToDelete;
    
    try {
      // If it's a new agent that hasn't been saved yet (just in local state)
      if (isTempId(id, 'new_agent')) {
          setEditingId(null);
          setNewAgentData(null);
          setDeleteModalOpen(false);
          return;
      }

      await apiAgents.delete(id);
      dispatch({ type: ACTION_TYPES.DELETE_AGENT, payload: { id } });
      if (editingId === id) {
          setEditingId(null);
          setNewAgentData(null);
      }
      showToast({ type: 'success', title: 'Agent Deleted', message: 'Agent deleted successfully.' });
    } catch (error) {
      console.error("Failed to delete agent:", error);
      const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
      showToast({ 
        type: 'error', 
        title: 'Delete Failed', 
        message: errorMessage 
      });
    } finally {
      setDeleteModalOpen(false);
      setAgentToDelete(null);
    }
  }, [agentToDelete, dispatch, editingId, showToast]);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <AgentList 
        agents={agents} 
        editingId={editingId} 
        onEdit={handleEdit} 
        onCreate={handleCreate} 
      />

      {currentAgent ? (
        <AgentForm 
          initialData={currentAgent} 
          onSave={handleSave} 
          onDelete={confirmDelete} 
        />
      ) : (
        <div className="w-full lg:w-2/3 p-8 overflow-y-auto flex flex-col items-center justify-center text-slate-500">
            <div 
              className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 cursor-pointer group"
              style={{ 
                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                willChange: 'transform'
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                
                const tiltX = deltaY * -8;
                const tiltY = deltaX * 8;
                const moveX = deltaX * 12;
                const moveY = deltaY * 12;
                
                e.currentTarget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateX(${moveX}px) translateY(${moveY - 8}px) scale(1.08)`;
                e.currentTarget.style.boxShadow = `0 0 40px rgba(34, 197, 220, 0.5), 0 ${moveY + 20}px 30px rgba(0, 0, 0, 0.4)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Bot size={32} className="text-cyan-500/50 group-hover:text-cyan-400 transition-colors duration-300 pointer-events-none" />
            </div>
            <p className="text-lg text-slate-400">Select an agent to edit</p>
            <p className="text-sm text-slate-600 mt-1">or create a new one</p>
        </div>
      )}

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Agent"
        footer={
          <>
            <button 
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Delete Agent
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this agent? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default AgentsView;