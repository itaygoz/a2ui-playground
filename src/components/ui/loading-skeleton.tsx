'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
  className?: string;
}

export function LoadingOverlay({ text = 'Loading...', className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        className
      )}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <div className="flex-1 space-y-4">
        {/* Message skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn('flex gap-3', i % 2 === 0 && 'justify-end')}>
            {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <div className="space-y-2">
              <Skeleton className={cn('h-4', i % 2 === 0 ? 'w-48' : 'w-64')} />
              <Skeleton className={cn('h-4', i % 2 === 0 ? 'w-32' : 'w-48')} />
            </div>
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
          </div>
        ))}
      </div>
      {/* Input skeleton */}
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}

// Pre-computed widths for deterministic rendering
const EDITOR_LINE_WIDTHS = ['70%', '45%', '60%', '35%', '55%', '80%', '40%', '65%', '50%', '75%'];

export function EditorSkeleton() {
  return (
    <div className="h-full p-4 space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 flex-1" />
      </div>
      {/* Code lines */}
      {EDITOR_LINE_WIDTHS.map((width, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4" style={{ width }} />
        </div>
      ))}
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function PaletteSkeleton() {
  return (
    <div className="h-full p-4 space-y-4">
      <Skeleton className="h-8 w-full" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TreeSkeleton() {
  return (
    <div className="h-full p-4 space-y-2">
      <Skeleton className="h-6 w-32 mb-4" />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2"
          style={{ paddingLeft: `${(i % 3) * 16}px` }}
        >
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

export function GameLibrarySkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
      {[1, 2, 3].map((i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
