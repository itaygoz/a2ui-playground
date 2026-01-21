'use client';

import React from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { JsonEditor } from '@/components/editor/json-editor';
import { PreviewContainer } from '@/components/preview/preview-container';
import { ChatPanel } from '@/components/chat/chat-panel';
import { GameLibrarySidebar } from '@/components/library/game-library-sidebar';
import { DndContextProvider } from '@/components/dnd';
import { ComponentPalette } from '@/components/palette';
import { ComponentTree } from '@/components/tree';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ExampleGallery } from '@/components/examples';
import { useA2UIStore } from '@/stores/a2ui-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  Eye,
  MessageSquare,
  Play,
  Undo,
  Redo,
  RotateCcw,
  Sparkles,
  Download,
  Palette,
  PanelRightClose,
  TreeDeciduous,
} from 'lucide-react';

export function MainLayout() {
  const {
    viewMode,
    setViewMode,
    playgroundMode,
    setPlaygroundMode,
    canUndo,
    canRedo,
    undo,
    redo,
    resetDocument,
    document,
  } = useA2UIStore();

  const [activeTab, setActiveTab] = React.useState<'chat' | 'editor' | 'tree'>('chat');
  const [showPalette, setShowPalette] = React.useState(true);

  const handlePlayGame = (game: { id: string; name: string }) => {
    // TODO: Implement game loading logic
    console.log('Play game:', game);
  };

  const handleEditGame = (game: { id: string; name: string }) => {
    // TODO: Implement game editing logic
    console.log('Edit game:', game);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(document, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.meta?.title || 'a2ui-document'}.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DndContextProvider>
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            A2UI Playground
          </h1>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={playgroundMode === 'playground' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPlaygroundMode('playground')}
              className="h-7"
            >
              <Code className="h-4 w-4 mr-1" />
              Playground
            </Button>
            <Button
              variant={playgroundMode === 'game' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setPlaygroundMode('game')}
              className="h-7"
            >
              <Play className="h-4 w-4 mr-1" />
              Game Creator
            </Button>
          </div>

          {/* Game Library - Only show in game mode */}
          {playgroundMode === 'game' && (
            <GameLibrarySidebar
              onPlayGame={handlePlayGame}
              onEditGame={handleEditGame}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* History Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Document Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetDocument}
            title="Reset"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <ExampleGallery />
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Export JSON"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          {/* Component Palette Toggle */}
          <Button
            variant={showPalette ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowPalette(!showPalette)}
            title={showPalette ? 'Hide Component Palette' : 'Show Component Palette'}
            className="gap-1"
          >
            {showPalette ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <Palette className="h-4 w-4" />
            )}
            Components
          </Button>

          <div className="h-6 w-px bg-border mx-2" />

          {/* View Controls */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'split' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('split')}
              title="Split View"
            >
              <div className="flex gap-0.5">
                <div className="w-1.5 h-3 bg-current rounded-sm" />
                <div className="w-1.5 h-3 bg-current rounded-sm" />
              </div>
            </Button>
            <Button
              variant={viewMode === 'editor' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('editor')}
              title="Editor Only"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('preview')}
              title="Preview Only"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {viewMode === 'split' && (
          <Allotment>
            {/* Left Panel: Chat + Editor */}
            <Allotment.Pane minSize={300} preferredSize="40%">
              <div className="h-full flex flex-col">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as 'chat' | 'editor' | 'tree')}
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="mx-4 mt-2 justify-start">
                    <TabsTrigger value="chat" className="gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="editor" className="gap-1">
                      <Code className="h-4 w-4" />
                      JSON
                    </TabsTrigger>
                    <TabsTrigger value="tree" className="gap-1">
                      <TreeDeciduous className="h-4 w-4" />
                      Tree
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat" className="flex-1 mt-0 overflow-hidden">
                    <ErrorBoundary>
                      <ChatPanel className="h-full" />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="editor" className="flex-1 mt-0 overflow-hidden">
                    <ErrorBoundary>
                      <JsonEditor className="h-full relative" />
                    </ErrorBoundary>
                  </TabsContent>
                  <TabsContent value="tree" className="flex-1 mt-0 overflow-hidden">
                    <ErrorBoundary>
                      <ComponentTree className="h-full" />
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>
              </div>
            </Allotment.Pane>

            {/* Middle Panel: Preview */}
            <Allotment.Pane minSize={300}>
              <ErrorBoundary>
                <PreviewContainer className="h-full" />
              </ErrorBoundary>
            </Allotment.Pane>

            {/* Right Panel: Component Palette */}
            {showPalette && (
              <Allotment.Pane minSize={200} maxSize={350} preferredSize={280}>
                <ErrorBoundary>
                  <ComponentPalette />
                </ErrorBoundary>
              </Allotment.Pane>
            )}
          </Allotment>
        )}

        {viewMode === 'editor' && (
          <div className="h-full flex">
            <div className="flex-1 border-r">
              <ErrorBoundary>
                <ChatPanel className="h-full" />
              </ErrorBoundary>
            </div>
            <div className="flex-1">
              <ErrorBoundary>
                <JsonEditor className="h-full relative" />
              </ErrorBoundary>
            </div>
            {showPalette && (
              <div className="w-72 border-l overflow-hidden">
                <ErrorBoundary>
                  <ComponentPalette />
                </ErrorBoundary>
              </div>
            )}
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="h-full flex">
            <ErrorBoundary>
              <PreviewContainer className="flex-1" />
            </ErrorBoundary>
            {showPalette && (
              <div className="w-72 border-l overflow-hidden">
                <ErrorBoundary>
                  <ComponentPalette />
                </ErrorBoundary>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
    </DndContextProvider>
  );
}
