'use client';

import React from 'react';
import type { AlertComponent } from '@/lib/a2ui/types';
import { useResolvedValue, useDataModel } from '../data-model-context';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface A2UIAlertProps {
  component: AlertComponent;
  children?: React.ReactNode;
}

const variantConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  classes: string;
}> = {
  default: {
    icon: Info,
    classes: 'bg-muted text-foreground border-border',
  },
  primary: {
    icon: Info,
    classes: 'bg-primary/10 text-primary border-primary/30',
  },
  secondary: {
    icon: Info,
    classes: 'bg-secondary text-secondary-foreground border-secondary',
  },
  success: {
    icon: CheckCircle,
    classes: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800',
  },
  error: {
    icon: AlertCircle,
    classes: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800',
  },
};

export function A2UIAlert({ component, children }: A2UIAlertProps) {
  const titleResolved = useResolvedValue(component.title ?? '');
  const message = useResolvedValue(component.message);
  const title = component.title ? titleResolved : undefined;
  const { variant, dismissible = false, onDismiss, style } = component;
  const { executeAction } = useDataModel();

  const config = variantConfig[variant] || variantConfig.default;
  const IconComponent = config.icon;

  const handleDismiss = () => {
    if (onDismiss) {
      executeAction(onDismiss);
    }
  };

  return (
    <div
      className={cn(
        'relative flex gap-3 p-4 rounded-lg border',
        config.classes
      )}
      style={styleToCSS(style)}
      role="alert"
    >
      <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && (
          <h5 className="font-medium mb-1">{title}</h5>
        )}
        <p className="text-sm">{message}</p>
        {children && (
          <div className="mt-3 flex gap-2">
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function styleToCSS(style?: AlertComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    opacity: style.opacity,
  };
}
