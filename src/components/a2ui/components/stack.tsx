'use client';

import React from 'react';
import type { StackComponent } from '@/lib/a2ui/types';
import { cn } from '@/lib/utils';

interface A2UIStackProps {
  component: StackComponent;
  children?: React.ReactNode;
}

const alignmentClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function A2UIStack({ component, children }: A2UIStackProps) {
  const { direction = 'vertical', spacing, alignment = 'stretch', style } = component;

  const className = cn(
    'flex',
    direction === 'horizontal' ? 'flex-row' : 'flex-col',
    alignmentClasses[alignment]
  );

  const inlineStyle: React.CSSProperties = {
    gap: typeof spacing === 'number' ? `${spacing}px` : spacing,
    ...styleToCSS(style),
  };

  return (
    <div className={className} style={inlineStyle}>
      {children}
    </div>
  );
}

function styleToCSS(style?: StackComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    height: typeof style.height === 'number' ? `${style.height}px` : style.height,
    minWidth: typeof style.minWidth === 'number' ? `${style.minWidth}px` : style.minWidth,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    minHeight: typeof style.minHeight === 'number' ? `${style.minHeight}px` : style.minHeight,
    maxHeight: typeof style.maxHeight === 'number' ? `${style.maxHeight}px` : style.maxHeight,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    borderWidth: typeof style.borderWidth === 'number' ? `${style.borderWidth}px` : style.borderWidth,
    borderColor: style.borderColor,
    borderStyle: style.borderStyle,
    opacity: style.opacity,
    flex: style.flex,
  };
}
