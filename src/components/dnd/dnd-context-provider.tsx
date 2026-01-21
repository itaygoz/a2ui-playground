'use client';

import React from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  createComponentFromPalette,
  type PaletteComponentData,
  type DropTarget,
} from '@/lib/dnd/a2ui-dnd-handlers';
import { useA2UIStore } from '@/stores/a2ui-store';

interface DndContextProviderProps {
  children: React.ReactNode;
}

export function DndContextProvider({ children }: DndContextProviderProps) {
  const { addComponent } = useA2UIStore();
  const [activeData, setActiveData] = React.useState<PaletteComponentData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'palette-component') {
      setActiveData(data as PaletteComponentData);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveData(null);

    const { active, over } = event;
    if (!over || !active.data.current) return;

    const dragData = active.data.current;
    const dropData = over.data.current;

    // Only handle palette drops for now
    if (dragData.type !== 'palette-component') return;

    // Determine drop target
    let target: DropTarget = { type: 'root' };

    if (dropData?.type === 'drop-zone') {
      target = {
        type: dropData.position || 'inside',
        targetId: dropData.componentId,
      };
    } else if (over.id === 'preview-area') {
      // Dropped on preview area - add to root
      target = { type: 'root' };
    }

    // Create and add the component
    const { component } = createComponentFromPalette(dragData as PaletteComponentData);
    addComponent(component, target);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeData && (
          <div className="p-3 rounded-lg border bg-card shadow-lg opacity-90">
            <p className="font-medium text-sm">{activeData.componentType}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
