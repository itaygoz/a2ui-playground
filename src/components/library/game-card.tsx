'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Play,
  Pencil,
  Trash2,
  HelpCircle,
  Grid3X3,
  Hash,
  BookOpen,
  Sparkles,
  PencilLine,
} from 'lucide-react';

export interface GameCardData {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  thumbnail?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GameCardProps {
  game: GameCardData;
  onPlay: (game: GameCardData) => void;
  onEdit: (game: GameCardData) => void;
  onDelete: (game: GameCardData) => void;
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  trivia: <HelpCircle className="h-4 w-4" />,
  memory: <Grid3X3 className="h-4 w-4" />,
  tictactoe: <Hash className="h-4 w-4" />,
  adventure: <BookOpen className="h-4 w-4" />,
  quiz: <Sparkles className="h-4 w-4" />,
  madlibs: <PencilLine className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  trivia: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  memory: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  tictactoe: 'bg-red-500/10 text-red-500 border-red-500/20',
  adventure: 'bg-green-500/10 text-green-500 border-green-500/20',
  quiz: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  madlibs: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
};

export function GameCard({ game, onPlay, onEdit, onDelete, className }: GameCardProps) {
  const icon = typeIcons[game.type] || <Sparkles className="h-4 w-4" />;
  const colorClass = typeColors[game.type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('gap-1', colorClass)}>
              {icon}
              {game.type}
            </Badge>
          </div>
          <h3 className="font-semibold truncate">{game.name}</h3>
          {game.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {game.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <Button
          size="sm"
          variant="default"
          onClick={() => onPlay(game)}
          className="gap-1"
        >
          <Play className="h-3 w-3" />
          Play
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(game)}
          className="gap-1"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(game)}
          className="gap-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
}
