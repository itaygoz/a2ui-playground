'use client';

import React from 'react';
import type { TabsComponent } from '@/lib/a2ui/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBoundValue, useDataModel } from '../data-model-context';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface A2UITabsProps {
  component: TabsComponent;
  children?: React.ReactNode;
}

export function A2UITabs({ component, children }: A2UITabsProps) {
  const [activeTab, setActiveTab] = useBoundValue<string>(component.activeTab);
  const { executeAction } = useDataModel();
  const { tabs, variant = 'default', onChange, style } = component;

  const handleChange = (value: string) => {
    setActiveTab(value);
    if (onChange) {
      executeAction(onChange);
    }
  };

  // Map children to their corresponding tab content
  const childArray = React.Children.toArray(children);

  return (
    <Tabs
      value={activeTab || tabs[0]?.id}
      onValueChange={handleChange}
      className="w-full"
      style={styleToCSS(style)}
    >
      <TabsList className={cn(
        variant === 'pills' && 'bg-muted p-1 rounded-lg',
        variant === 'underline' && 'bg-transparent border-b rounded-none'
      )}>
        {tabs.map((tab) => {
          // Get icon component if specified
          let IconComponent: React.ComponentType<{ className?: string }> | null = null;
          if (tab.icon) {
            const iconName = tab.icon
              .split('-')
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join('');
            IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName] || null;
          }

          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                variant === 'pills' && 'data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md',
                variant === 'underline' && 'border-b-2 border-transparent data-[state=active]:border-primary rounded-none'
              )}
            >
              {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {childArray[index]}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function styleToCSS(style?: TabsComponent['style']): React.CSSProperties {
  if (!style) return {};

  return {
    padding: typeof style.padding === 'number' ? `${style.padding}px` : style.padding,
    margin: typeof style.margin === 'number' ? `${style.margin}px` : style.margin,
    width: typeof style.width === 'number' ? `${style.width}px` : style.width,
    maxWidth: typeof style.maxWidth === 'number' ? `${style.maxWidth}px` : style.maxWidth,
    opacity: style.opacity,
  };
}
