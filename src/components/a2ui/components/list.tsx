'use client';

import React from 'react';
import type { ListComponent } from '@/lib/a2ui/types';
import { useDataModel } from '../data-model-context';
import { getValueByPointer } from '@/lib/a2ui/json-pointer';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface A2UIListProps {
  component: ListComponent;
  children?: React.ReactNode;
}

export function A2UIList({ component, children }: A2UIListProps) {
  const { dataModel, executeAction } = useDataModel();
  const { items, separator = false, selectable = false, selectedIndex, onItemSelect, style } = component;

  // Get items from data model
  const itemsData = getValueByPointer<unknown[]>(dataModel, items) ?? [];
  const selectedIdx = selectedIndex ? getValueByPointer<number>(dataModel, selectedIndex) : undefined;

  // For now, we render children (which should be the item templates repeated)
  // In a full implementation, we'd clone the itemTemplate for each item

  const handleItemClick = (index: number) => {
    if (selectable && onItemSelect) {
      executeAction({
        ...onItemSelect,
        payload: { ...onItemSelect.payload, index },
      });
    }
  };

  if (itemsData.length === 0 && children) {
    // Render empty state or template
    return (
      <div style={styleToCSS(style)}>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-0" style={styleToCSS(style)} role="list">
      {itemsData.map((_, index) => (
        <React.Fragment key={index}>
          <div
            role="listitem"
            onClick={() => handleItemClick(index)}
            className={cn(
              selectable && 'cursor-pointer hover:bg-accent',
              selectable && selectedIdx === index && 'bg-accent'
            )}
          >
            {/* Children would be cloned with item data context in full implementation */}
            {React.Children.map(children, (child, childIndex) =>
              childIndex === 0 ? child : null
            )}
          </div>
          {separator && index < itemsData.length - 1 && (
            <Separator />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function styleToCSS(style?: ListComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    maxHeight: typeof style.maxHeight === 'number' ? `${style.maxHeight}px` : style.maxHeight,
    backgroundColor: style.backgroundColor,
    borderRadius: typeof style.borderRadius === 'number' ? `${style.borderRadius}px` : style.borderRadius,
    opacity: style.opacity,
  };
}
