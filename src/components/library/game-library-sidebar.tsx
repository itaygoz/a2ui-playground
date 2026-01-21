'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GameCard, type GameCardData } from './game-card';
import { CreateGameModal } from './create-game-modal';
import { cn } from '@/lib/utils';
import {
  Library,
  Plus,
  Search,
  Loader2,
  FolderOpen,
} from 'lucide-react';

interface GameLibrarySidebarProps {
  onPlayGame: (game: GameCardData) => void;
  onEditGame: (game: GameCardData) => void;
  className?: string;
}

export function GameLibrarySidebar({
  onPlayGame,
  onEditGame,
  className,
}: GameLibrarySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [games, setGames] = useState<GameCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<GameCardData | null>(null);

  // Fetch games from API
  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch games when sidebar opens
  useEffect(() => {
    if (isOpen) {
      fetchGames();
    }
  }, [isOpen, fetchGames]);

  // Filter games by search query
  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (game: GameCardData) => {
    try {
      const response = await fetch(`/api/games/${game.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setGames((prev) => prev.filter((g) => g.id !== game.id));
      }
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
    setGameToDelete(null);
  };

  // Handle game created
  const handleGameCreated = (game: GameCardData) => {
    setGames((prev) => [game, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', className)}
          >
            <Library className="h-4 w-4" />
            Game Library
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Game Library
              </SheetTitle>
              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                New Game
              </Button>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="p-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredGames.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">
                    {searchQuery ? 'No games found' : 'No games yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'Create your first game to get started'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Create Game
                    </Button>
                  )}
                </div>
              ) : (
                filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={(g) => {
                      onPlayGame(g);
                      setIsOpen(false);
                    }}
                    onEdit={(g) => {
                      onEditGame(g);
                      setIsOpen(false);
                    }}
                    onDelete={setGameToDelete}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Create Game Modal */}
      <CreateGameModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onGameCreated={handleGameCreated}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!gameToDelete}
        onOpenChange={(open) => !open && setGameToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{gameToDelete?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => gameToDelete && handleDelete(gameToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
