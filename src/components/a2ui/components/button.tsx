'use client';

import React from 'react';
import type { ButtonComponent } from '@/lib/a2ui/types';
import { Button } from '@/components/ui/button';
import { useResolvedValue, useDataModel } from '../data-model-context';
import * as LucideIcons from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface A2UIButtonProps {
  component: ButtonComponent;
}

const sizeMap = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-4',
  lg: 'h-10 px-6',
  xl: 'h-11 px-8 text-lg',
  '2xl': 'h-12 px-10 text-xl',
  '3xl': 'h-14 px-12 text-2xl',
};

// Map A2UI button variants to shadcn button variants
const variantMap: Record<string, 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'> = {
  default: 'default',
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
  destructive: 'destructive',
  danger: 'destructive',
};

export function A2UIButton({ component }: A2UIButtonProps) {
  const label = useResolvedValue(component.label);
  const loadingResolved = useResolvedValue(component.loading ?? false);
  const disabledResolved = useResolvedValue(component.disabled ?? false);

  const loading = component.loading !== undefined ? loadingResolved : false;
  const disabled = component.disabled !== undefined ? disabledResolved : false;

  const { executeAction } = useDataModel();
  const {
    variant = 'default',
    size = 'md',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    onPress,
    style,
  } = component;

  // Get icon component if specified
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;
  if (icon) {
    const iconName = icon
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || null;
  }

  const handleClick = () => {
    if (!disabled && !loading && onPress) {
      executeAction(onPress);
    }
  };

  const sizeClass = sizeMap[size];

  const mappedVariant = variantMap[variant] || 'default';

  return (
    <Button
      variant={mappedVariant}
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(sizeClass, fullWidth && 'w-full')}
      style={styleToCSS(style)}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && IconComponent && iconPosition === 'left' && (
        <IconComponent className="mr-2 h-4 w-4" />
      )}
      {label}
      {!loading && IconComponent && iconPosition === 'right' && (
        <IconComponent className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

function styleToCSS(style?: ButtonComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: style.width !== undefined
      ? typeof style.width === 'number' ? `${style.width}px` : style.width
      : undefined,
    opacity: style.opacity,
  };
}
