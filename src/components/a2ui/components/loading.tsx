'use client';

import React from 'react';
import type { LoadingComponent } from '@/lib/a2ui/types';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface A2UILoadingProps {
  component: LoadingComponent;
}

const sizeMap = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
  '2xl': 'h-12 w-12',
  '3xl': 'h-16 w-16',
};

export function A2UILoading({ component }: A2UILoadingProps) {
  const { size = 'md', text, variant = 'spinner', style } = component;
  const sizeClass = sizeMap[size];

  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      style={styleToCSS(style)}
      role="status"
      aria-label={text || 'Loading'}
    >
      {variant === 'spinner' && (
        <Loader2 className={cn(sizeClass, 'animate-spin text-primary')} />
      )}
      {variant === 'dots' && (
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-primary',
                size === 'xs' && 'h-1 w-1',
                size === 'sm' && 'h-1.5 w-1.5',
                size === 'md' && 'h-2 w-2',
                size === 'lg' && 'h-2.5 w-2.5',
                size === 'xl' && 'h-3 w-3',
                size === '2xl' && 'h-4 w-4',
                size === '3xl' && 'h-5 w-5'
              )}
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      )}
      {variant === 'bar' && (
        <div className={cn(
          'overflow-hidden bg-secondary rounded-full',
          size === 'xs' && 'h-0.5 w-12',
          size === 'sm' && 'h-1 w-16',
          size === 'md' && 'h-1.5 w-24',
          size === 'lg' && 'h-2 w-32',
          size === 'xl' && 'h-2.5 w-40',
          size === '2xl' && 'h-3 w-48',
          size === '3xl' && 'h-4 w-56'
        )}>
          <div
            className="h-full bg-primary rounded-full animate-pulse"
            style={{
              animation: 'indeterminate 1.5s infinite ease-in-out',
            }}
          />
        </div>
      )}
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 50%;
          }
          50% {
            width: 30%;
          }
          100% {
            transform: translateX(300%);
            width: 50%;
          }
        }
        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function styleToCSS(style?: LoadingComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
