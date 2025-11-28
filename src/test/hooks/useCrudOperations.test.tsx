import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCrudOperations } from '../../../hooks/useCrudOperations';
import { ToastProvider } from '../../../components/ui/Toast';
import type { ReactNode } from 'react';

interface TestItem {
  id: string;
  name: string;
}

const mockApi = {
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockDispatch = vi.fn();

const createConfig = () => ({
  api: mockApi,
  entityName: 'Item',
  dispatch: mockDispatch,
  addAction: 'ADD_ITEM',
  updateAction: 'UPDATE_ITEM',
  deleteAction: 'DELETE_ITEM',
  isTempId: (id: string) => id.startsWith('temp_'),
  generateId: (data: TestItem) => `item_${data.name.toLowerCase()}`,
  getDisplayName: (data: TestItem) => data.name,
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useCrudOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      expect(result.current.editingId).toBeNull();
      expect(result.current.deleteModalOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleCreate', () => {
    it('should set editingId to new item id', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.handleCreate({ id: 'temp_123', name: 'New Item' });
      });
      
      expect(result.current.editingId).toBe('temp_123');
    });
  });

  describe('handleEdit', () => {
    it('should set editingId to item id', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.handleEdit({ id: 'item_1', name: 'Existing Item' });
      });
      
      expect(result.current.editingId).toBe('item_1');
    });
  });

  describe('setEditingId', () => {
    it('should update editingId', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.setEditingId('new_id');
      });
      
      expect(result.current.editingId).toBe('new_id');
    });

    it('should clear editingId when set to null', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.setEditingId('some_id');
      });
      
      act(() => {
        result.current.setEditingId(null);
      });
      
      expect(result.current.editingId).toBeNull();
    });
  });

  describe('handleSave - create new item', () => {
    it('should create new item and dispatch ADD action', async () => {
      const createdItem = { id: 'item_test', name: 'Test' };
      mockApi.create.mockResolvedValue(createdItem);
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      await act(async () => {
        await result.current.handleSave({ id: 'temp_123', name: 'Test' });
      });
      
      expect(mockApi.create).toHaveBeenCalledWith({ id: 'item_test', name: 'Test' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'ADD_ITEM', payload: createdItem });
      expect(result.current.editingId).toBeNull();
    });

    it('should handle create error', async () => {
      mockApi.create.mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      await act(async () => {
        await result.current.handleSave({ id: 'temp_123', name: 'Test' });
      });
      
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('handleSave - update existing item', () => {
    it('should update existing item and dispatch UPDATE action', async () => {
      const updatedItem = { id: 'item_1', name: 'Updated' };
      mockApi.update.mockResolvedValue(updatedItem);
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      await act(async () => {
        await result.current.handleSave({ id: 'item_1', name: 'Updated' });
      });
      
      expect(mockApi.update).toHaveBeenCalledWith('item_1', { id: 'item_1', name: 'Updated' });
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'UPDATE_ITEM', payload: updatedItem });
      expect(result.current.editingId).toBeNull();
    });

    it('should handle update error', async () => {
      mockApi.update.mockRejectedValue(new Error('Update failed'));
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      await act(async () => {
        await result.current.handleSave({ id: 'item_1', name: 'Updated' });
      });
      
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('confirmDelete', () => {
    it('should open delete modal and set item to delete', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.confirmDelete('item_1');
      });
      
      expect(result.current.deleteModalOpen).toBe(true);
      expect(result.current.itemToDelete).toBe('item_1');
    });
  });

  describe('handleDelete', () => {
    it('should delete item and dispatch DELETE action', async () => {
      mockApi.delete.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.confirmDelete('item_1');
      });
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(mockApi.delete).toHaveBeenCalledWith('item_1');
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_ITEM', payload: { id: 'item_1' } });
      expect(result.current.deleteModalOpen).toBe(false);
      expect(result.current.itemToDelete).toBeNull();
    });

    it('should handle temp item deletion without API call', async () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.setEditingId('temp_123');
        result.current.confirmDelete('temp_123');
      });
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(mockApi.delete).not.toHaveBeenCalled();
      expect(result.current.editingId).toBeNull();
      expect(result.current.deleteModalOpen).toBe(false);
    });

    it('should do nothing if no item to delete', async () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(mockApi.delete).not.toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      mockApi.delete.mockRejectedValue(new Error('Delete failed'));
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.confirmDelete('item_1');
      });
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.deleteModalOpen).toBe(false);
    });

    it('should clear editingId if deleting the editing item', async () => {
      mockApi.delete.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.setEditingId('item_1');
        result.current.confirmDelete('item_1');
      });
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(result.current.editingId).toBeNull();
    });
  });

  describe('setDeleteModalOpen', () => {
    it('should toggle delete modal', () => {
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.setDeleteModalOpen(true);
      });
      
      expect(result.current.deleteModalOpen).toBe(true);
      
      act(() => {
        result.current.setDeleteModalOpen(false);
      });
      
      expect(result.current.deleteModalOpen).toBe(false);
    });
  });

  describe('error handling with non-Error objects', () => {
    it('should handle non-Error thrown objects on create', async () => {
      mockApi.create.mockRejectedValue('String error');
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      await act(async () => {
        await result.current.handleSave({ id: 'temp_123', name: 'Test' });
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error thrown objects on delete', async () => {
      mockApi.delete.mockRejectedValue({ message: 'Object error' });
      
      const { result } = renderHook(() => useCrudOperations<TestItem>(createConfig()), { wrapper });
      
      act(() => {
        result.current.confirmDelete('item_1');
      });
      
      await act(async () => {
        await result.current.handleDelete();
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });
});
