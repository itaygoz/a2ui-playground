'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { templateInfo, type TemplateInfo } from '@/lib/game/templates';
import type { GameCardData } from './game-card';

interface CreateGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGameCreated: (game: GameCardData) => void;
}

export function CreateGameModal({
  open,
  onOpenChange,
  onGameCreated,
}: CreateGameModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedTemplate = templateInfo.find((t) => t.type === selectedType);

  const handleCreate = async () => {
    if (!selectedType || !name.trim()) return;

    setIsCreating(true);
    try {
      // Create default A2UI template and config based on type
      const defaultA2ui = {
        version: '1.0',
        root: 'root',
        components: {
          root: {
            id: 'root',
            type: 'Column',
            children: ['title', 'description'],
            style: { padding: 24, gap: 16 },
          },
          title: {
            id: 'title',
            type: 'Text',
            content: name,
            variant: 'h1',
            align: 'center',
          },
          description: {
            id: 'description',
            type: 'Text',
            content: description || `A ${selectedType} game`,
            variant: 'body',
            align: 'center',
            color: 'secondary',
          },
        },
        dataModel: {},
        meta: { gameType: selectedType },
      };

      const defaultConfig = {
        type: selectedType,
        title: name,
        description,
        ...getDefaultConfigForType(selectedType),
      };

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type: selectedType,
          a2uiTemplate: defaultA2ui,
          gameConfig: defaultConfig,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onGameCreated(data.game);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setSelectedType('');
    setName('');
    setDescription('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'Choose Game Type' : 'Game Details'}
          </DialogTitle>
          <DialogDescription>
            {step === 'type'
              ? 'Select the type of game you want to create'
              : 'Give your game a name and description'}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' ? (
          <div className="space-y-4 py-4">
            <RadioGroup
              value={selectedType}
              onValueChange={setSelectedType}
              className="grid gap-3"
            >
              {templateInfo.map((template) => (
                <GameTypeOption
                  key={template.type}
                  template={template}
                  selected={selectedType === template.type}
                />
              ))}
            </RadioGroup>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('details')}
                disabled={!selectedType || !selectedTemplate?.available}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Game Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`My ${selectedTemplate?.name} Game`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your game..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('type')}
                disabled={isCreating}
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Game'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface GameTypeOptionProps {
  template: TemplateInfo;
  selected: boolean;
}

function GameTypeOption({ template, selected }: GameTypeOptionProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted/50',
        !template.available && 'opacity-50 cursor-not-allowed'
      )}
    >
      <RadioGroupItem
        value={template.type}
        disabled={!template.available}
        className="sr-only"
      />
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
        style={{ backgroundColor: template.color }}
      >
        <GameTypeIcon type={template.type} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{template.name}</span>
          {!template.available && (
            <Badge variant="secondary" className="text-xs">
              Coming Soon
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
    </label>
  );
}

function GameTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    trivia: '?',
    memory: '🎴',
    tictactoe: '#',
    adventure: '📖',
    quiz: '✨',
    madlibs: '✏️',
  };
  return <span className="text-lg">{icons[type] || '🎮'}</span>;
}

function getDefaultConfigForType(type: string): Record<string, unknown> {
  switch (type) {
    case 'trivia':
      return {
        questionCount: 10,
        showExplanations: true,
      };
    case 'memory':
      return {
        pairCount: 8,
        cardTheme: 'emoji',
        cards: [],
      };
    case 'tictactoe':
      return {
        playerFirst: true,
        aiDifficulty: 'medium',
      };
    case 'adventure':
      return {
        startNodeId: 'start',
      };
    case 'quiz':
      return {
        personality: 'default',
        results: [],
      };
    case 'madlibs':
      return {
        storyTemplate: '',
        prompts: [],
      };
    default:
      return {};
  }
}
