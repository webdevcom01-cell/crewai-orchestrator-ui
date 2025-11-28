import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

/**
 * Generic API interface for CRUD operations
 */
interface CrudApi<T> {
  create: (data: Omit<T, 'id'> & { id?: string }) => Promise<T>;
  update: (id: string, data: T) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

/**
 * Configuration for the CRUD hook
 */
interface UseCrudConfig<T> {
  api: CrudApi<T>;
  entityName: string; // e.g., 'Agent', 'Task'
  dispatch: React.Dispatch<any>;
  addAction: string;
  updateAction: string;
  deleteAction: string;
  isTempId: (id: string) => boolean;
  generateId: (data: T) => string;
  getDisplayName: (data: T) => string;
}

/**
 * Return type for the CRUD hook
 */
interface UseCrudReturn<T> {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  itemToDelete: string | null;
  handleCreate: (newItem: T) => void;
  handleEdit: (item: T) => void;
  handleSave: (data: T) => Promise<void>;
  confirmDelete: (id: string) => void;
  handleDelete: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Generic hook for CRUD operations to reduce code duplication
 * between AgentsView and TasksView
 */
export function useCrudOperations<T extends { id: string; name?: string }>(
  config: UseCrudConfig<T>
): UseCrudReturn<T> {
  const { 
    api, 
    entityName, 
    dispatch, 
    addAction, 
    updateAction, 
    deleteAction,
    isTempId,
    generateId,
    getDisplayName 
  } = config;

  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = useCallback((newItem: T) => {
    setEditingId(newItem.id);
  }, []);

  const handleEdit = useCallback((item: T) => {
    setEditingId(item.id);
  }, []);

  const handleSave = useCallback(async (data: T) => {
    const isNew = isTempId(data.id);
    const finalId = isNew ? generateId(data) : data.id;
    const finalData = { ...data, id: finalId };

    setIsLoading(true);
    try {
      if (isNew) {
        const created = await api.create(finalData);
        dispatch({ type: addAction, payload: created });
        setEditingId(null);
        showToast({ 
          type: 'success', 
          title: `${entityName} Created`, 
          message: `${entityName} ${getDisplayName(created)} created successfully.` 
        });
      } else {
        const updated = await api.update(data.id, finalData);
        dispatch({ type: updateAction, payload: updated });
        setEditingId(null);
        showToast({ 
          type: 'success', 
          title: `${entityName} Updated`, 
          message: `${entityName} ${getDisplayName(updated)} updated successfully.` 
        });
      }
    } catch (error) {
      console.error(`Failed to save ${entityName.toLowerCase()}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
      showToast({ 
        type: 'error', 
        title: 'Save Failed', 
        message: errorMessage 
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, dispatch, addAction, updateAction, entityName, isTempId, generateId, getDisplayName, showToast]);

  const confirmDelete = useCallback((id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!itemToDelete) return;
    const id = itemToDelete;

    // If it's a temp item, just clear without API call
    if (isTempId(id)) {
      setEditingId(null);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(id);
      dispatch({ type: deleteAction, payload: { id } });
      if (editingId === id) {
        setEditingId(null);
      }
      showToast({ 
        type: 'success', 
        title: `${entityName} Deleted`, 
        message: `${entityName} deleted successfully.` 
      });
    } catch (error) {
      console.error(`Failed to delete ${entityName.toLowerCase()}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Network error or server unavailable';
      showToast({ 
        type: 'error', 
        title: 'Delete Failed', 
        message: errorMessage 
      });
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, api, dispatch, deleteAction, editingId, entityName, isTempId, showToast]);

  return {
    editingId,
    setEditingId,
    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    handleCreate,
    handleEdit,
    handleSave,
    confirmDelete,
    handleDelete,
    isLoading,
  };
}

export default useCrudOperations;
