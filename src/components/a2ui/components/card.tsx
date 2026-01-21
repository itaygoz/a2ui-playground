'use client';

import React from 'react';
import type { CardComponent } from '@/lib/a2ui/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UICardProps {
  component: CardComponent;
  children?: React.ReactNode;
}

const variantClasses = {
  default: '',
  outlined: 'border-2',
  elevated: 'shadow-lg',
};

export function A2UICard({ component, children }: A2UICardProps) {
  const titleResolved = useResolvedValue(component.title ?? '');
  const subtitleResolved = useResolvedValue(component.subtitle ?? '');

  const title = component.title ? titleResolved : undefined;
  const subtitle = component.subtitle ? subtitleResolved : undefined;
  const { variant = 'default', style } = component;

  const hasHeader = title || subtitle;
  // Note: header/footer actions would need special handling with SingleComponentRenderer
  // For now, we render children in the content area

  return (
    <Card
      className={cn(variantClasses[variant])}
      style={styleToCSS(style)}
    >
      {hasHeader && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={cn(!hasHeader && 'pt-6')}>
        {children}
      </CardContent>
    </Card>
  );
}

function styleToCSS(style?: CardComponent['style']): React.CSSProperties {
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
