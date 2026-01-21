'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SafeA2UIRenderer } from '@/components/a2ui/renderer';
import { useA2UIStore } from '@/stores/a2ui-store';
import { cn } from '@/lib/utils';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DeviceSize = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceSize, { width: string; icon: React.ComponentType<{ className?: string }> }> = {
  desktop: { width: '100%', icon: Monitor },
  tablet: { width: '768px', icon: Tablet },
  mobile: { width: '375px', icon: Smartphone },
};

interface PreviewContainerProps {
  className?: string;
}

export function PreviewContainer({ className }: PreviewContainerProps) {
  const { document, setDataModel, handleAction } = useA2UIStore();
  const [deviceSize, setDeviceSize] = React.useState<DeviceSize>('desktop');

  // Make the preview area a drop zone
  const { setNodeRef, isOver } = useDroppable({
    id: 'preview-area',
    data: {
      type: 'drop-zone',
      position: 'root',
    },
  });

  const handleDataModelChange = React.useCallback(
    (newDataModel: Record<string, unknown>) => {
      setDataModel(newDataModel);
    },
    [setDataModel]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Device Size Selector */}
      <div className="flex items-center justify-center gap-2 p-2 border-b bg-muted/50">
        {(Object.entries(deviceSizes) as [DeviceSize, typeof deviceSizes[DeviceSize]][]).map(
          ([size, { icon: Icon }]) => (
            <Button
              key={size}
              variant={deviceSize === size ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setDeviceSize(size)}
              className="h-8"
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        )}
      </div>

      {/* Preview Area */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-auto bg-background p-4 transition-colors',
          isOver && 'bg-accent/20 ring-2 ring-accent ring-inset'
        )}
      >
        <div
          className={cn(
            'mx-auto transition-all duration-300',
            deviceSize !== 'desktop' && 'border rounded-lg shadow-lg bg-background'
          )}
          style={{
            width: deviceSizes[deviceSize].width,
            maxWidth: '100%',
            minHeight: deviceSize === 'mobile' ? '667px' : deviceSize === 'tablet' ? '1024px' : 'auto',
          }}
        >
          <SafeA2UIRenderer
            document={document}
            onDataModelChange={handleDataModelChange}
            onAction={handleAction}
            className="min-h-full"
          />
        </div>
      </div>
    </div>
  );
}
