'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useA2UIStore } from '@/stores/a2ui-store';
import { StreamingA2UIParser } from '@/lib/ai/streaming-parser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, Loader2, Sparkles, User, Bot, CheckCircle } from 'lucide-react';

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const {
    messages,
    addMessage,
    isGenerating,
    setIsGenerating,
    setDocument,
    playgroundMode,
  } = useA2UIStore();

  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setStreamingText('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsGenerating(true);

    try {
      // Prepare messages for API
      const chatMessages = [
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          mode: playgroundMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      const parser = new StreamingA2UIParser();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);

                // Try to parse A2UI document from stream
                const doc = parser.append(parsed.text);
                if (doc) {
                  setDocument(doc);
                }
              }
              if (parsed.error) {
                console.error('Stream error:', parsed.error);
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Finalize and add assistant message
      const result = parser.finalize();
      const lastDoc = result.documents[result.documents.length - 1];

      addMessage({
        role: 'assistant',
        content: fullText,
        a2uiDocument: lastDoc,
      });

      // Apply the last valid document
      if (lastDoc) {
        setDocument(lastDoc);
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  }, [input, isGenerating, messages, playgroundMode, addMessage, setIsGenerating, setDocument]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestedPrompts = playgroundMode === 'game'
    ? [
        'Create a trivia game about space',
        'Make a choose-your-own-adventure horror story',
        'Build a memory matching game with animals',
      ]
    : [
        'Create a login form with email and password',
        'Make a settings page with toggles and sliders',
        'Build a product card with image and price',
      ];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && !streamingText && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">
                {playgroundMode === 'game' ? 'Game Creator' : 'A2UI Playground'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {playgroundMode === 'game'
                  ? 'Describe a game and I\'ll create it for you!'
                  : 'Describe a UI and I\'ll generate the A2UI code.'}
              </p>

              {/* Suggested prompts */}
              <div className="space-y-2 max-w-md mx-auto">
                {suggestedPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => setInput(prompt)}
                  >
                    <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Streaming message */}
          {streamingText && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{streamingText}</div>
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              playgroundMode === 'game'
                ? 'Describe the game you want to create...'
                : 'Describe the UI you want to create...'
            }
            className="min-h-[80px] resize-none"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isGenerating}
            className="h-auto"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    a2uiDocument?: unknown;
  };
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const hasDocument = !!message.a2uiDocument;

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-secondary' : 'bg-primary'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div
        className={cn(
          'flex-1 max-w-[85%]',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MessageContent content={message.content} />
          </div>
        </div>
        {hasDocument && (
          <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            A2UI document applied
          </div>
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown rendering for code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
          if (match) {
            const [, lang, code] = match;
            return (
              <pre key={i} className="bg-secondary/50 rounded p-2 overflow-x-auto text-xs">
                <code className={lang ? `language-${lang}` : ''}>{code}</code>
              </pre>
            );
          }
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </>
  );
}
