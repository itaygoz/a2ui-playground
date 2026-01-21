'use client';

import React, { useState } from 'react';
import type { ExpandableComponent } from '@/lib/a2ui/types';
import { useResolvedValue, useDataModel } from '../data-model-context';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface A2UIExpandableProps {
  component: ExpandableComponent;
  children?: React.ReactNode;
}

export function A2UIExpandable({ component, children }: A2UIExpandableProps) {
  const title = useResolvedValue(component.title);
  const expandedResolved = useResolvedValue(component.expanded ?? false);
  const resolvedExpanded = component.expanded !== undefined ? expandedResolved : undefined;

  const { executeAction } = useDataModel();
  const [localExpanded, setLocalExpanded] = useState(resolvedExpanded ?? false);

  const isExpanded = resolvedExpanded !== undefined ? resolvedExpanded : localExpanded;
  const { onToggle, style } = component;

  const handleToggle = () => {
    if (onToggle) {
      executeAction(onToggle);
    } else {
      setLocalExpanded(!isExpanded);
    }
  };

  return (
    <div style={styleToCSS(style)}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="font-medium">{title}</span>
      </button>
      {isExpanded && (
        <div className="pl-6 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

function styleToCSS(style?: ExpandableComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    borderWidth: typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    opacity: style.opacity,
  };
}
