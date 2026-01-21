'use client';

import React from 'react';
import type { LinkComponent } from '@/lib/a2ui/types';
import { useResolvedValue } from '../data-model-context';
import { cn } from '@/lib/utils';

interface A2UILinkProps {
  component: LinkComponent;
}

export function A2UILink({ component }: A2UILinkProps) {
  const text = useResolvedValue(component.text);
  const { href, external = false, underline = true, style } = component;

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'text-primary hover:text-primary/80 transition-colors',
        underline && 'underline underline-offset-4'
      )}
      style={styleToCSS(style)}
    >
      {text}
    </a>
  );
}

function styleToCSS(style?: LinkComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    opacity: style.opacity,
  };
}
