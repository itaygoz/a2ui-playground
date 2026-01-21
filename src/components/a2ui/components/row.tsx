'use client';

import React from 'react';
import type { RowComponent } from '@/lib/a2ui/types';
import { cn } from '@/lib/utils';

interface A2UIRowProps {
  component: RowComponent;
  children?: React.ReactNode;
}

const mainAxisClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
};

const crossAxisClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export function A2UIRow({ component, children }: A2UIRowProps) {
  const {
    mainAxisAlignment = 'start',
    crossAxisAlignment = 'center',
    wrap = false,
    gap,
    style,
  } = component;

  const className = cn(
    'flex flex-row',
    mainAxisClasses[mainAxisAlignment],
    crossAxisClasses[crossAxisAlignment],
    wrap && 'flex-wrap'
  );

  const inlineStyle: React.CSSProperties = {
    gap: typeof gap === 'number' ? `${gap}px` : gap,
    ...styleToCSS(style),
  };

  return (
    <div className={className} style={inlineStyle}>
      {children}
    </div>
  );
}

function styleToCSS(style?: RowComponent['style']): React.CSSProperties {
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
