'use client';

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DraggableComponent, type ComponentDefinition } from './draggable-component';
import { cn } from '@/lib/utils';
import {
  Type,
  Image,
  Square,
  SplitSquareVertical,
  LayoutGrid,
  Columns,
  Rows,
  CreditCard,
  ToggleLeft,
  Sliders,
  FormInput,
  CheckSquare,
  CircleDot,
  List,
  ChevronDown,
  Calendar,
  Loader,
  Link2,
  Minus,
  Search,
  GripVertical,
  Box,
  Badge,
  CircleUser,
  TrendingUp,
  Info,
  MessageSquare,
  PanelLeftOpen,
} from 'lucide-react';

// Define all available components with their metadata
const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  // Layout Components
  {
    type: 'Row',
    name: 'Row',
    description: 'Horizontal layout',
    icon: <Columns className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      mainAxisAlignment: 'start',
      crossAxisAlignment: 'center',
    },
  },
  {
    type: 'Column',
    name: 'Column',
    description: 'Vertical layout',
    icon: <Rows className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      mainAxisAlignment: 'start',
      crossAxisAlignment: 'stretch',
    },
  },
  {
    type: 'Card',
    name: 'Card',
    description: 'Container card',
    icon: <CreditCard className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      variant: 'default',
    },
  },
  {
    type: 'Container',
    name: 'Container',
    description: 'Content container',
    icon: <Box className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      centered: true,
    },
  },
  {
    type: 'Grid',
    name: 'Grid',
    description: 'Grid layout',
    icon: <LayoutGrid className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      columns: 2,
      gap: 16,
    },
  },
  {
    type: 'Stack',
    name: 'Stack',
    description: 'Stacked elements',
    icon: <SplitSquareVertical className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      direction: 'vertical',
      spacing: 16,
    },
  },
  {
    type: 'ScrollView',
    name: 'ScrollView',
    description: 'Scrollable area',
    icon: <PanelLeftOpen className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      direction: 'vertical',
    },
  },
  {
    type: 'Expandable',
    name: 'Expandable',
    description: 'Collapsible section',
    icon: <ChevronDown className="h-4 w-4" />,
    category: 'layout',
    defaultProps: {
      children: [],
      title: 'Section',
      expanded: false,
    },
  },

  // Display Components
  {
    type: 'Text',
    name: 'Text',
    description: 'Text content',
    icon: <Type className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      content: 'Text content',
      variant: 'body',
    },
  },
  {
    type: 'Image',
    name: 'Image',
    description: 'Image element',
    icon: <Image className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      src: 'https://via.placeholder.com/200',
      alt: 'Image',
      fit: 'contain',
    },
  },
  {
    type: 'Icon',
    name: 'Icon',
    description: 'Icon element',
    icon: <Square className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      name: 'star',
      size: 'md',
    },
  },
  {
    type: 'Badge',
    name: 'Badge',
    description: 'Badge label',
    icon: <Badge className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      content: 'Badge',
      variant: 'default',
    },
  },
  {
    type: 'Avatar',
    name: 'Avatar',
    description: 'User avatar',
    icon: <CircleUser className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      fallback: 'U',
      size: 'md',
    },
  },
  {
    type: 'Progress',
    name: 'Progress',
    description: 'Progress indicator',
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      value: 50,
      max: 100,
      variant: 'default',
    },
  },
  {
    type: 'Divider',
    name: 'Divider',
    description: 'Horizontal line',
    icon: <Minus className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      orientation: 'horizontal',
    },
  },
  {
    type: 'Spacer',
    name: 'Spacer',
    description: 'Empty space',
    icon: <GripVertical className="h-4 w-4" />,
    category: 'display',
    defaultProps: {
      size: 'md',
    },
  },

  // Input Components
  {
    type: 'Button',
    name: 'Button',
    description: 'Clickable button',
    icon: <Square className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      label: 'Button',
      variant: 'default',
      onPress: { type: 'custom', handler: 'handleClick' },
    },
  },
  {
    type: 'TextField',
    name: 'TextField',
    description: 'Text input',
    icon: <FormInput className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      value: '/formData/text',
      placeholder: 'Enter text...',
    },
  },
  {
    type: 'TextArea',
    name: 'TextArea',
    description: 'Multi-line text',
    icon: <MessageSquare className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      value: '/formData/description',
      placeholder: 'Enter description...',
      rows: 4,
    },
  },
  {
    type: 'Checkbox',
    name: 'Checkbox',
    description: 'Boolean toggle',
    icon: <CheckSquare className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      checked: '/formData/checked',
      label: 'Checkbox',
    },
  },
  {
    type: 'RadioGroup',
    name: 'RadioGroup',
    description: 'Option selection',
    icon: <CircleDot className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      value: '/formData/option',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ],
    },
  },
  {
    type: 'Select',
    name: 'Select',
    description: 'Dropdown select',
    icon: <ChevronDown className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      value: '/formData/selected',
      placeholder: 'Select...',
      options: [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
      ],
    },
  },
  {
    type: 'Slider',
    name: 'Slider',
    description: 'Range slider',
    icon: <Sliders className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      value: '/formData/value',
      min: 0,
      max: 100,
    },
  },
  {
    type: 'Switch',
    name: 'Switch',
    description: 'Toggle switch',
    icon: <ToggleLeft className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      checked: '/formData/enabled',
      label: 'Switch',
    },
  },
  {
    type: 'DatePicker',
    name: 'DatePicker',
    description: 'Date selection',
    icon: <Calendar className="h-4 w-4" />,
    category: 'input',
    defaultProps: {
      value: '/formData/date',
      placeholder: 'Select date...',
    },
  },

  // Navigation Components
  {
    type: 'Link',
    name: 'Link',
    description: 'Navigation link',
    icon: <Link2 className="h-4 w-4" />,
    category: 'navigation',
    defaultProps: {
      text: 'Link',
      href: '#',
    },
  },
  {
    type: 'Tabs',
    name: 'Tabs',
    description: 'Tab navigation',
    icon: <List className="h-4 w-4" />,
    category: 'navigation',
    defaultProps: {
      activeTab: '/ui/activeTab',
      tabs: [
        { id: 'tab1', label: 'Tab 1', content: 'content-1' },
        { id: 'tab2', label: 'Tab 2', content: 'content-2' },
      ],
    },
  },

  // Feedback Components
  {
    type: 'Alert',
    name: 'Alert',
    description: 'Alert message',
    icon: <Info className="h-4 w-4" />,
    category: 'feedback',
    defaultProps: {
      message: 'This is an alert',
      variant: 'info',
    },
  },
  {
    type: 'Tooltip',
    name: 'Tooltip',
    description: 'Hover tooltip',
    icon: <MessageSquare className="h-4 w-4" />,
    category: 'feedback',
    defaultProps: {
      content: 'Tooltip text',
      children: [],
    },
  },
  {
    type: 'Loading',
    name: 'Loading',
    description: 'Loading indicator',
    icon: <Loader className="h-4 w-4" />,
    category: 'feedback',
    defaultProps: {
      size: 'md',
      variant: 'spinner',
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'layout', label: 'Layout' },
  { id: 'display', label: 'Display' },
  { id: 'input', label: 'Input' },
  { id: 'navigation', label: 'Nav' },
  { id: 'feedback', label: 'Feedback' },
] as const;

interface ComponentPaletteProps {
  className?: string;
}

export function ComponentPalette({ className }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredComponents = COMPONENT_DEFINITIONS.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || comp.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <h3 className="font-semibold text-sm">Components</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-4 mt-2 flex-wrap h-auto gap-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="text-xs px-2 py-1"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="flex-1 mt-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No components found
                </div>
              ) : (
                filteredComponents.map((comp) => (
                  <DraggableComponent key={comp.type} component={comp} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { COMPONENT_DEFINITIONS };
