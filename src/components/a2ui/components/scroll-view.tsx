'use client';

import React from 'react';
import type { ScrollViewComponent } from '@/lib/a2ui/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface A2UIScrollViewProps {
  component: ScrollViewComponent;
  children?: React.ReactNode;
}

export function A2UIScrollView({ component, children }: A2UIScrollViewProps) {
  const { direction = 'vertical', showScrollbar = true, style } = component;

  const scrollAreaClass = cn(
    direction === 'horizontal' && 'whitespace-nowrap',
    'w-full h-full'
  );

  return (
    <ScrollArea
      className={scrollAreaClass}
      style={styleToCSS(style)}
    >
      <div className={direction === 'horizontal' ? 'flex' : ''}>
        {children}
      </div>
      {showScrollbar && (
        <>
          {(direction === 'vertical' || direction === 'both') && (
            <ScrollBar orientation="vertical" />
          )}
          {(direction === 'horizontal' || direction === 'both') && (
            <ScrollBar orientation="horizontal" />
          )}
        </>
      )}
    </ScrollArea>
  );
}

function styleToCSS(style?: ScrollViewComponent['style']): React.CSSProperties {
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
