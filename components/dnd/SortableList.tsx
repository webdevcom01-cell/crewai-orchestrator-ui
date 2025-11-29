import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';

interface SortableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  renderDragOverlay?: (item: T) => React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function SortableList<T>({
  items,
  keyExtractor,
  onReorder,
  renderItem,
  renderDragOverlay,
  disabled = false,
  className = '',
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => keyExtractor(item) === active.id);
      const newIndex = items.findIndex((item) => keyExtractor(item) === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  const activeItem = activeId 
    ? items.find((item) => keyExtractor(item) === activeId) 
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        items={items.map(keyExtractor)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        <div className={className}>
          {items.map((item, index) => renderItem(item, index, keyExtractor(item) === activeId))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem && renderDragOverlay ? (
          <div className="shadow-2xl rounded-lg">
            {renderDragOverlay(activeItem)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableList;
