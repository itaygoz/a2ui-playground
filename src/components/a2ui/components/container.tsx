'use client';

import React from 'react';
import type { ContainerComponent } from '@/lib/a2ui/types';
import { cn } from '@/lib/utils';

interface A2UIContainerProps {
  component: ContainerComponent;
  children?: React.ReactNode;
}

export function A2UIContainer({ component, children }: A2UIContainerProps) {
  const { maxWidth, centered = false, style } = component;

  const className = cn(centered && 'mx-auto');

  const inlineStyle: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    ...styleToCSS(style),
  };

  return (
    <div className={className} style={inlineStyle}>
      {children}
    </div>
  );
}

function styleToCSS(style?: ContainerComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    height: typeof style.height === 'number' ? `${style.height}px` : style.height,
    minWidth: typeof style.minWidth === 'number' ? `${style.minWidth}px` : style.minWidth,
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
