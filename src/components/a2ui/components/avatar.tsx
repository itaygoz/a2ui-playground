'use client';

import React from 'react';
import type { AvatarComponent } from '@/lib/a2ui/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UIAvatarProps {
  component: AvatarComponent;
}

const sizeMap = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20',
  '3xl': 'h-24 w-24',
};

export function A2UIAvatar({ component }: A2UIAvatarProps) {
  const srcResolved = useResolvedValue(component.src ?? '');
  const src = component.src ? srcResolved : undefined;
  const { alt = '', fallback = '?', size = 'md', style } = component;

  const sizeClass = typeof size === 'number' ? '' : sizeMap[size];
  const customSize = typeof size === 'number' ? { width: size, height: size } : {};

  return (
    <Avatar
      className={cn(sizeClass)}
      style={{ ...customSize, ...styleToCSS(style) }}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback>
        {fallback.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function styleToCSS(style?: AvatarComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
