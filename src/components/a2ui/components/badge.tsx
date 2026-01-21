'use client';

import React from 'react';
import type { BadgeComponent } from '@/lib/a2ui/types';
import { Badge } from '@/components/ui/badge';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UIBadgeProps {
  component: BadgeComponent;
}

const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  default: 'default',
  primary: 'default',
  secondary: 'secondary',
  success: 'default',
  warning: 'secondary',
  error: 'destructive',
  info: 'outline',
};

const variantColorClasses: Record<string, string> = {
  success: 'bg-green-500 hover:bg-green-600',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  info: 'bg-blue-500 hover:bg-blue-600 text-white',
};

const sizeClasses = {
  xs: 'text-[10px] px-1.5 py-0',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
  xl: 'text-lg px-4 py-1.5',
  '2xl': 'text-xl px-5 py-2',
  '3xl': 'text-2xl px-6 py-2.5',
};

export function A2UIBadge({ component }: A2UIBadgeProps) {
  const text = useResolvedValue(component.text);
  const { variant = 'default', size = 'md', style } = component;

  const badgeVariant = variantMap[variant] || 'default';
  const colorClass = variantColorClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <Badge
      variant={badgeVariant}
      className={cn(sizeClass, colorClass)}
      style={styleToCSS(style)}
    >
      {text}
    </Badge>
  );
}

function styleToCSS(style?: BadgeComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
