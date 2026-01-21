'use client';

import React from 'react';
import type { TextComponent } from '@/lib/a2ui/types';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UITextProps {
  component: TextComponent;
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export function A2UIText({ component }: A2UITextProps) {
  const text = useResolvedValue(component.text);
  const { textStyle = {}, style } = component;

  const className = cn(
    sizeClasses[textStyle.size || 'md'],
    weightClasses[textStyle.weight || 'normal'],
    alignClasses[textStyle.align || 'left'],
    textStyle.style === 'italic' && 'italic',
    textStyle.decoration === 'underline' && 'underline',
    textStyle.decoration === 'line-through' && 'line-through'
  );

  const inlineStyle: React.CSSProperties = {
    color: textStyle.color,
    lineHeight: textStyle.lineHeight,
    letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
    ...styleToCSS(style),
  };

  return (
    <span className={className} style={inlineStyle}>
      {text}
    </span>
  );
}

// Helper to convert A2UI style to CSS
function styleToCSS(style?: TextComponent['style']): React.CSSProperties {
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
