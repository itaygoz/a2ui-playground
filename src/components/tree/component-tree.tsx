'use client';

import React from 'react';
import { useA2UIStore } from '@/stores/a2ui-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ChevronDown,
  Trash2,
  GripVertical,
  Square,
  Columns,
  Rows,
  LayoutGrid,
  Type,
  Image,
  MousePointerClick,
  TextCursorInput,
  ToggleLeft,
  SlidersHorizontal,
} from 'lucide-react';
import type { ComponentId } from '@/lib/a2ui/types';

// Component type to icon mapping
const componentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Column: Columns,
  Row: Rows,
  Card: Square,
  Grid: LayoutGrid,
  Text: Type,
  Image: Image,
  Button: MousePointerClick,
  TextField: TextCursorInput,
  Checkbox: ToggleLeft,
  Slider: SlidersHorizontal,
};

interface TreeNodeProps {
  componentId: ComponentId;
  depth: number;
}

function TreeNode({ componentId, depth }: TreeNodeProps) {
  const { document, selectedComponentId, setSelectedComponentId, deleteComponent } =
    useA2UIStore();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const component = document.components[componentId];
  if (!component) return null;

  const children = 'children' in component ? component.children : undefined;
  const hasChildren = children && children.length > 0;
  const isSelected = selectedComponentId === componentId;
  const isRoot = componentId === document.root;

  const Icon = componentIcons[component.type] || Square;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedComponentId(componentId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRoot) {
      deleteComponent(componentId);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer group',
          'hover:bg-accent/50',
          isSelected && 'bg-accent text-accent-foreground'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* Expand/Collapse Toggle */}
        <button
          className={cn(
            'p-0.5 hover:bg-accent/50 rounded',
            !hasChildren && 'invisible'
          )}
          onClick={handleToggle}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {/* Drag Handle */}
        {!isRoot && (
          <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
        )}

        {/* Icon */}
        <Icon className="h-4 w-4 text-muted-foreground" />

        {/* Label */}
        <span className="text-sm flex-1 truncate">
          {component.type}
          <span className="text-muted-foreground text-xs ml-1">
            #{componentId}
          </span>
        </span>

        {/* Delete Button */}
        {!isRoot && (
          <button
            className="p-1 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100"
            onClick={handleDelete}
            title="Delete component"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {children!.map((childId) => (
            <TreeNode key={childId} componentId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ComponentTreeProps {
  className?: string;
}

export function ComponentTree({ className }: ComponentTreeProps) {
  const { document, selectedComponentId, setSelectedComponentId } = useA2UIStore();

  const handleClearSelection = () => {
    setSelectedComponentId(null);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Component Tree</h3>
        {selectedComponentId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="h-6 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2">
        {document.root && (
          <TreeNode componentId={document.root} depth={0} />
        )}
      </div>

      {/* Selected Component Info */}
      {selectedComponentId && document.components[selectedComponentId] && (
        <div className="border-t p-3 bg-muted/30">
          <div className="text-xs text-muted-foreground mb-1">Selected</div>
          <div className="text-sm font-medium">
            {document.components[selectedComponentId].type}
          </div>
          <div className="text-xs text-muted-foreground">
            ID: {selectedComponentId}
          </div>
        </div>
      )}
    </div>
  );
}
