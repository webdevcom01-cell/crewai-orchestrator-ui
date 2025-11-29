import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SortableItem({ id, children, disabled = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'shadow-2xl' : ''}`}
    >
      {/* Drag Handle */}
      {!disabled && (
        <button
          {...attributes}
          {...listeners}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                     p-2 opacity-0 group-hover:opacity-100 transition-opacity
                     cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </button>
      )}
      {children}
    </div>
  );
}

export default SortableItem;
