'use client';

import React from 'react';
import type { GridComponent } from '@/lib/a2ui/types';

interface A2UIGridProps {
  component: GridComponent;
  children?: React.ReactNode;
}

export function A2UIGrid({ component, children }: A2UIGridProps) {
  const { columns, rows, gap, columnGap, rowGap, style } = component;

  const inlineStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: formatGridTemplate(columns),
    gridTemplateRows: formatGridTemplate(rows),
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    columnGap: typeof columnGap === 'number' ? `${columnGap}px` : columnGap,
    rowGap: typeof rowGap === 'number' ? `${rowGap}px` : rowGap,
    ...styleToCSS(style),
  };

  return (
    <div style={inlineStyle}>
      {children}
    </div>
  );
}

function formatGridTemplate(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return `repeat(${value}, 1fr)`;
  }
  return value;
}

function styleToCSS(style?: GridComponent['style']): React.CSSProperties {
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
