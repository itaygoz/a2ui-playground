'use client';

import React from 'react';
import type { ImageComponent } from '@/lib/a2ui/types';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UIImageProps {
  component: ImageComponent;
}

const fitClasses = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

export function A2UIImage({ component }: A2UIImageProps) {
  const src = useResolvedValue(component.src);
  const { alt = '', fit = 'cover', aspectRatio, style } = component;

  const className = cn(fitClasses[fit]);

  const inlineStyle: React.CSSProperties = {
    aspectRatio: aspectRatio,
    ...styleToCSS(style),
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={inlineStyle}
    />
  );
}

function styleToCSS(style?: ImageComponent['style']): React.CSSProperties {
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
