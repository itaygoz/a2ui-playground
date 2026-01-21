'use client';

import React from 'react';
import type { DividerComponent } from '@/lib/a2ui/types';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface A2UIDividerProps {
  component: DividerComponent;
}

export function A2UIDivider({ component }: A2UIDividerProps) {
  const { orientation = 'horizontal', thickness, color, style } = component;

  const inlineStyle: React.CSSProperties = {
    backgroundColor: color,
    ...(orientation === 'horizontal'
      ? { height: thickness ? `${thickness}px` : undefined }
      : { width: thickness ? `${thickness}px` : undefined }),
    ...styleToCSS(style),
  };

  return (
    <Separator
      orientation={orientation}
      style={inlineStyle}
      className={cn(color && 'bg-current')}
    />
  );
}

function styleToCSS(style?: DividerComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
