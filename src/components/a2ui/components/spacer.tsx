'use client';

import React from 'react';
import type { SpacerComponent } from '@/lib/a2ui/types';

interface A2UISpacerProps {
  component: SpacerComponent;
}

const sizeMap = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export function A2UISpacer({ component }: A2UISpacerProps) {
  const { size = 'md' } = component;

  const dimension = typeof size === 'number' ? `${size}px` : sizeMap[size];

  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}
