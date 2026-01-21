/**
 * Game Templates Index
 *
 * Export all game templates and registration utilities.
 */

import type { GameTemplate, GameType } from '../types';
import { getGameEngine } from '../engine';

// Import templates
import { triviaTemplate } from './trivia';
import { memoryTemplate } from './memory';
import { tictactoeTemplate } from './tictactoe';
import { adventureTemplate } from './adventure';

// Export individual templates
export { triviaTemplate } from './trivia';
export { memoryTemplate } from './memory';
export { tictactoeTemplate } from './tictactoe';
export { adventureTemplate } from './adventure';

// All templates map
export const templates: Record<GameType, GameTemplate | undefined> = {
  trivia: triviaTemplate,
  memory: memoryTemplate,
  tictactoe: tictactoeTemplate,
  adventure: adventureTemplate,
  quiz: undefined, // TODO: Implement
  madlibs: undefined, // TODO: Implement
  custom: undefined,
};

// Get template by type
export function getTemplate(type: GameType): GameTemplate | undefined {
  return templates[type];
}

// Get all available templates
export function getAvailableTemplates(): GameTemplate[] {
  return Object.values(templates).filter((t): t is GameTemplate => t !== undefined);
}

// Register all templates with the game engine
export function registerAllTemplates(): void {
  const engine = getGameEngine();

  if (triviaTemplate) engine.registerTemplate(triviaTemplate);
  if (memoryTemplate) engine.registerTemplate(memoryTemplate);
  if (tictactoeTemplate) engine.registerTemplate(tictactoeTemplate);
  if (adventureTemplate) engine.registerTemplate(adventureTemplate);
}

// Template metadata for UI display
export interface TemplateInfo {
  type: GameType;
  name: string;
  description: string;
  icon: string;
  color: string;
  available: boolean;
}

export const templateInfo: TemplateInfo[] = [
  {
    type: 'trivia',
    name: 'Trivia',
    description: 'Multiple choice trivia questions',
    icon: 'help-circle',
    color: '#3b82f6',
    available: true,
  },
  {
    type: 'memory',
    name: 'Memory Match',
    description: 'Find matching pairs of cards',
    icon: 'grid-3x3',
    color: '#8b5cf6',
    available: true,
  },
  {
    type: 'tictactoe',
    name: 'Tic-Tac-Toe',
    description: 'Classic game against AI',
    icon: 'hash',
    color: '#ef4444',
    available: true,
  },
  {
    type: 'adventure',
    name: 'Adventure',
    description: 'Choose-your-own-adventure story',
    icon: 'book-open',
    color: '#22c55e',
    available: true,
  },
  {
    type: 'quiz',
    name: 'Personality Quiz',
    description: 'Discover your personality type',
    icon: 'sparkles',
    color: '#f59e0b',
    available: false,
  },
  {
    type: 'madlibs',
    name: 'Mad Libs',
    description: 'Fill-in-the-blank stories',
    icon: 'pencil',
    color: '#ec4899',
    available: false,
  },
];
