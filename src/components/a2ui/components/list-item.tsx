'use client';

import React from 'react';
import type { ListItemComponent } from '@/lib/a2ui/types';
import { useDataModel } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UIListItemProps {
  component: ListItemComponent;
  children?: React.ReactNode;
}

export function A2UIListItem({ component, children }: A2UIListItemProps) {
  const { executeAction } = useDataModel();
  const { onPress, style } = component;

  const handleClick = () => {
    if (onPress) {
      executeAction(onPress);
    }
  };

  const isClickable = !!onPress;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3',
        isClickable && 'cursor-pointer hover:bg-accent rounded-md transition-colors'
      )}
      onClick={isClickable ? handleClick : undefined}
      style={styleToCSS(style)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

function styleToCSS(style?: ListItemComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    opacity: style.opacity,
  };
}
