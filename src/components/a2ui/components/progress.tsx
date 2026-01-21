'use client';

import React from 'react';
import type { ProgressComponent } from '@/lib/a2ui/types';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UIProgressProps {
  component: ProgressComponent;
}

const variantClasses: Record<string, string> = {
  default: 'bg-primary',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

export function A2UIProgress({ component }: A2UIProgressProps) {
  const value = useResolvedValue(component.value);
  const { max = 100, variant = 'default', showLabel = false, style } = component;

  const percentage = Math.min(Math.max((Number(value) / max) * 100, 0), 100);
  const colorClass = variantClasses[variant];

  return (
    <div className="w-full" style={styleToCSS(style)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full transition-all', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-muted-foreground text-right">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
}

function styleToCSS(style?: ProgressComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    opacity: style.opacity,
  };
}
