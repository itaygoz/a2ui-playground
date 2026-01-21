'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { IconComponent } from '@/lib/a2ui/types';

interface A2UIIconProps {
  component: IconComponent;
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

export function A2UIIcon({ component }: A2UIIconProps) {
  const { name, size = 'md', color, style } = component;

  // Convert icon name to PascalCase for Lucide
  const iconName = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; className?: string }>>)[iconName];

  if (!IconComponent) {
    console.warn(`Icon not found: ${name} (tried ${iconName})`);
    return (
      <span className="inline-flex items-center justify-center text-muted-foreground">
        [?]
      </span>
    );
  }

  const iconSize = typeof size === 'number' ? size : sizeMap[size];

  const inlineStyle: React.CSSProperties = styleToCSS(style);
  const hasStyle = Object.keys(inlineStyle).length > 0;

  const iconElement = (
    <IconComponent
      size={iconSize}
      color={color}
    />
  );

  // Wrap in span if we need to apply styles
  if (hasStyle) {
    return (
      <span className="inline-flex" style={inlineStyle}>
        {iconElement}
      </span>
    );
  }

  return iconElement;
}

function styleToCSS(style?: IconComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
