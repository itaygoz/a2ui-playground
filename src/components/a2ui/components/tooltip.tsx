'use client';

import React from 'react';
import type { TooltipComponent } from '@/lib/a2ui/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useResolvedValue } from '../data-model-context';

interface A2UITooltipProps {
  component: TooltipComponent;
  children?: React.ReactNode;
}

const positionMap: Record<string, 'top' | 'bottom' | 'left' | 'right'> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
};

export function A2UITooltip({ component, children }: A2UITooltipProps) {
  const content = useResolvedValue(component.content);
  const { position = 'top', delay = 200, style } = component;

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span style={styleToCSS(style)}>{children}</span>
        </TooltipTrigger>
        <TooltipContent side={positionMap[position]}>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function styleToCSS(style?: TooltipComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    display: 'inline-block',
    opacity: style.opacity,
  };
}
