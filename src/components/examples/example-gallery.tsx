'use client';

import React from 'react';
import { useA2UIStore } from '@/stores/a2ui-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Code, Layout, FormInput, Gamepad2 } from 'lucide-react';
import type { A2UIDocument } from '@/lib/a2ui/types';

// Example A2UI documents
const EXAMPLES: Array<{
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'forms' | 'layouts' | 'interactive';
  icon: React.ComponentType<{ className?: string }>;
  document: A2UIDocument;
}> = [
  {
    id: 'hello-world',
    title: 'Hello World',
    description: 'A simple card with text and a button',
    category: 'basic',
    icon: Code,
    document: {
      version: '1.0',
      root: 'root',
      components: {
        root: {
          id: 'root',
          type: 'Column',
          children: ['card'],
          style: { padding: 24, gap: 16, maxWidth: 400 },
        },
        card: {
          id: 'card',
          type: 'Card',
          title: 'Hello A2UI!',
          subtitle: 'Your first component',
          children: ['content'],
        },
        content: {
          id: 'content',
          type: 'Column',
          children: ['text', 'button'],
          style: { gap: 12 },
        },
        text: {
          id: 'text',
          type: 'Text',
          text: 'Welcome to A2UI - the AI-to-UI specification.',
        },
        button: {
          id: 'button',
          type: 'Button',
          label: 'Click Me',
          variant: 'default',
          onPress: { type: 'custom', handler: 'alert' },
        },
      },
      dataModel: {},
      meta: { title: 'Hello World', created: new Date().toISOString() },
    },
  },
  {
    id: 'contact-form',
    title: 'Contact Form',
    description: 'A form with input fields and validation',
    category: 'forms',
    icon: FormInput,
    document: {
      version: '1.0',
      root: 'root',
      components: {
        root: {
          id: 'root',
          type: 'Column',
          children: ['form-card'],
          style: { padding: 24, maxWidth: 500 },
        },
        'form-card': {
          id: 'form-card',
          type: 'Card',
          title: 'Contact Us',
          subtitle: 'We would love to hear from you',
          children: ['form-content'],
        },
        'form-content': {
          id: 'form-content',
          type: 'Column',
          children: ['name-field', 'email-field', 'message-field', 'submit-btn'],
          style: { gap: 16 },
        },
        'name-field': {
          id: 'name-field',
          type: 'TextField',
          label: 'Your Name',
          placeholder: 'John Doe',
          value: '/name',
        },
        'email-field': {
          id: 'email-field',
          type: 'TextField',
          label: 'Email Address',
          placeholder: 'john@example.com',
          value: '/email',
        },
        'message-field': {
          id: 'message-field',
          type: 'TextField',
          label: 'Message',
          placeholder: 'Tell us what you think...',
          value: '/message',
        },
        'submit-btn': {
          id: 'submit-btn',
          type: 'Button',
          label: 'Send Message',
          variant: 'default',
          onPress: { type: 'submit', payload: { form: 'contact' } },
        },
      },
      dataModel: { name: '', email: '', message: '' },
      meta: { title: 'Contact Form', created: new Date().toISOString() },
    },
  },
  {
    id: 'dashboard-layout',
    title: 'Dashboard Layout',
    description: 'A responsive layout with cards and stats',
    category: 'layouts',
    icon: Layout,
    document: {
      version: '1.0',
      root: 'root',
      components: {
        root: {
          id: 'root',
          type: 'Column',
          children: ['header', 'stats-row', 'content-row'],
          style: { padding: 24, gap: 24 },
        },
        header: {
          id: 'header',
          type: 'Text',
          text: 'Dashboard',
          textStyle: { size: '2xl', weight: 'bold' },
        },
        'stats-row': {
          id: 'stats-row',
          type: 'Row',
          children: ['stat1', 'stat2', 'stat3'],
          style: { gap: 16 },
        },
        stat1: {
          id: 'stat1',
          type: 'Card',
          title: '2,453',
          subtitle: 'Total Users',
          children: [],
        },
        stat2: {
          id: 'stat2',
          type: 'Card',
          title: '$12,450',
          subtitle: 'Revenue',
          children: [],
        },
        stat3: {
          id: 'stat3',
          type: 'Card',
          title: '98.5%',
          subtitle: 'Uptime',
          children: [],
        },
        'content-row': {
          id: 'content-row',
          type: 'Row',
          children: ['main-card', 'sidebar-card'],
          style: { gap: 16 },
        },
        'main-card': {
          id: 'main-card',
          type: 'Card',
          title: 'Recent Activity',
          children: ['activity-text'],
        },
        'activity-text': {
          id: 'activity-text',
          type: 'Text',
          text: 'Activity log will appear here...',
        },
        'sidebar-card': {
          id: 'sidebar-card',
          type: 'Card',
          title: 'Quick Actions',
          children: ['action-buttons'],
        },
        'action-buttons': {
          id: 'action-buttons',
          type: 'Column',
          children: ['btn1', 'btn2'],
          style: { gap: 8 },
        },
        btn1: {
          id: 'btn1',
          type: 'Button',
          label: 'Create Report',
          variant: 'outline',
          onPress: { type: 'custom', handler: 'createReport' },
        },
        btn2: {
          id: 'btn2',
          type: 'Button',
          label: 'View Analytics',
          variant: 'outline',
          onPress: { type: 'custom', handler: 'viewAnalytics' },
        },
      },
      dataModel: {},
      meta: { title: 'Dashboard Layout', created: new Date().toISOString() },
    },
  },
  {
    id: 'interactive-counter',
    title: 'Interactive Counter',
    description: 'A counter with increment/decrement buttons',
    category: 'interactive',
    icon: Gamepad2,
    document: {
      version: '1.0',
      root: 'root',
      components: {
        root: {
          id: 'root',
          type: 'Column',
          children: ['counter-card'],
          style: { padding: 24, maxWidth: 300, alignItems: 'center' },
        },
        'counter-card': {
          id: 'counter-card',
          type: 'Card',
          title: 'Counter',
          children: ['counter-content'],
        },
        'counter-content': {
          id: 'counter-content',
          type: 'Column',
          children: ['count-display', 'button-row'],
          style: { gap: 16, alignItems: 'center' },
        },
        'count-display': {
          id: 'count-display',
          type: 'Text',
          text: '/count',
          textStyle: { size: '2xl', weight: 'bold' },
        },
        'button-row': {
          id: 'button-row',
          type: 'Row',
          children: ['dec-btn', 'inc-btn'],
          style: { gap: 8 },
        },
        'dec-btn': {
          id: 'dec-btn',
          type: 'Button',
          label: '-',
          variant: 'outline',
          onPress: { type: 'update', target: '/count', value: -1 },
        },
        'inc-btn': {
          id: 'inc-btn',
          type: 'Button',
          label: '+',
          variant: 'default',
          onPress: { type: 'update', target: '/count', value: 1 },
        },
      },
      dataModel: { count: 0 },
      meta: { title: 'Interactive Counter', created: new Date().toISOString() },
    },
  },
];

const categoryColors: Record<string, string> = {
  basic: 'bg-blue-100 text-blue-800',
  forms: 'bg-green-100 text-green-800',
  layouts: 'bg-purple-100 text-purple-800',
  interactive: 'bg-orange-100 text-orange-800',
};

interface ExampleGalleryProps {
  className?: string;
}

export function ExampleGallery({ className }: ExampleGalleryProps) {
  const { setDocument } = useA2UIStore();
  const [open, setOpen] = React.useState(false);

  const handleSelectExample = (document: A2UIDocument) => {
    setDocument(document);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <BookOpen className="h-4 w-4 mr-1" />
          Examples
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Example Gallery</DialogTitle>
          <DialogDescription>
            Choose an example to load into the playground
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {EXAMPLES.map((example) => {
            const Icon = example.icon;
            return (
              <Card
                key={example.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleSelectExample(example.document)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{example.title}</CardTitle>
                    </div>
                    <Badge className={categoryColors[example.category]}>
                      {example.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{example.description}</CardDescription>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectExample(example.document);
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Load
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
