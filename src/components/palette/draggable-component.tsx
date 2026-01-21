'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import type { ComponentType } from '@/lib/a2ui/types';

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'layout' | 'display' | 'input' | 'navigation' | 'feedback';
  defaultProps: Record<string, unknown>;
}

interface DraggableComponentProps {
  component: ComponentDefinition;
  className?: string;
}

export function DraggableComponent({ component, className }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: {
      type: 'palette-component',
      componentType: component.type,
      defaultProps: component.defaultProps,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab',
        'hover:bg-accent hover:border-accent-foreground/20 transition-colors',
        isDragging && 'opacity-50 cursor-grabbing shadow-lg',
        className
      )}
    >
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
        {component.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{component.name}</p>
        <p className="text-xs text-muted-foreground truncate">{component.description}</p>
      </div>
    </div>
  );
}
