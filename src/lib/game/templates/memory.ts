/**
 * Memory Game Template
 *
 * Match pairs of cards memory game.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  GameTemplate,
  MemoryGameState,
  MemoryGameConfig,
  GameAction,
  MemoryCard,
} from '../types';
import type { A2UIDocument, A2UIComponent } from '@/lib/a2ui/types';

// Default emoji pairs for memory game
const DEFAULT_EMOJI_PAIRS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
];

// ============================================================================
// Initial State
// ============================================================================

export function createInitialState(config: MemoryGameConfig): MemoryGameState {
  const cards = createCards(config);

  return {
    type: 'memory',
    status: 'not_started',
    currentPhase: 'playing',
    score: 0,
    maxScore: config.pairCount * 100,
    turn: 0,
    history: [],
    cards,
    flippedIndices: [],
    matchedPairs: 0,
    totalPairs: config.pairCount,
    moves: 0,
  };
}

function createCards(config: MemoryGameConfig): MemoryCard[] {
  const pairs = config.cards?.length > 0
    ? config.cards
    : DEFAULT_EMOJI_PAIRS.slice(0, config.pairCount).map((emoji, i) => ({
        content: emoji,
        pairId: `pair-${i}`,
      }));

  // Create card pairs
  const cards: MemoryCard[] = [];
  pairs.forEach((pair, index) => {
    // Create two cards for each pair
    cards.push({
      id: uuidv4(),
      content: pair.content,
      pairId: pair.pairId || `pair-${index}`,
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: uuidv4(),
      content: pair.content,
      pairId: pair.pairId || `pair-${index}`,
      isFlipped: false,
      isMatched: false,
    });
  });

  // Shuffle cards
  return shuffleArray(cards);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// A2UI Generation
// ============================================================================

export function generateA2ui(state: MemoryGameState, config: MemoryGameConfig): A2UIDocument {
  const componentId = (suffix: string) => `memory-${suffix}`;

  if (state.status === 'not_started') {
    return createIntroScreen(componentId, config);
  }

  if (state.status === 'completed') {
    return createResultsScreen(componentId, state, config);
  }

  return createGameScreen(componentId, state, config);
}

function createIntroScreen(
  componentId: (s: string) => string,
  config: MemoryGameConfig
): A2UIDocument {
  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('title'), componentId('description'), componentId('start-btn')],
        crossAxisAlignment: 'center',
        style: { padding: 24, gap: 16 },
      },
      [componentId('title')]: {
        id: componentId('title'),
        type: 'Text',
        content: config.title || 'Memory Game',
        variant: 'h1',
        align: 'center',
      },
      [componentId('description')]: {
        id: componentId('description'),
        type: 'Text',
        content: config.description || `Match ${config.pairCount} pairs of cards!`,
        variant: 'body',
        align: 'center',
        color: 'secondary',
      },
      [componentId('start-btn')]: {
        id: componentId('start-btn'),
        type: 'Button',
        label: 'Start Game',
        variant: 'primary',
        onPress: {
          type: 'custom',
          handler: 'startGame',
        },
      },
    } as Record<string, A2UIComponent>,
    dataModel: {},
    meta: { gameType: 'memory', phase: 'intro' },
  };
}

function createGameScreen(
  componentId: (s: string) => string,
  state: MemoryGameState,
  _config: MemoryGameConfig
): A2UIDocument {
  const cardComponents: Record<string, A2UIComponent> = {};
  const cardIds: string[] = [];

  // Calculate grid columns based on pair count
  const totalCards = state.cards.length;
  let columns = 4;
  if (totalCards <= 8) columns = 4;
  else if (totalCards <= 12) columns = 4;
  else if (totalCards <= 16) columns = 4;
  else columns = 6;

  state.cards.forEach((card, index) => {
    const cardId = componentId(`card-${index}`);
    cardIds.push(cardId);

    const isFlipped = state.flippedIndices.includes(index) || card.isMatched;
    const isDisabled = isFlipped || state.flippedIndices.length >= 2;

    cardComponents[cardId] = {
      id: cardId,
      type: 'Button',
      label: isFlipped ? card.content : '?',
      variant: card.isMatched ? 'secondary' : isFlipped ? 'default' : 'outline',
      disabled: isDisabled,
      style: {
        width: 60,
        height: 60,
        fontSize: isFlipped ? 24 : 18,
      },
      onPress: {
        type: 'custom',
        handler: 'flipCard',
        params: { index },
      },
    };
  });

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('header'), componentId('grid')],
        style: { padding: 24, gap: 16 },
      },
      [componentId('header')]: {
        id: componentId('header'),
        type: 'Row',
        children: [componentId('moves'), componentId('pairs')],
        mainAxisAlignment: 'space-between',
        style: { gap: 16 },
      },
      [componentId('moves')]: {
        id: componentId('moves'),
        type: 'Badge',
        content: `Moves: ${state.moves}`,
        variant: 'outline',
      },
      [componentId('pairs')]: {
        id: componentId('pairs'),
        type: 'Badge',
        content: `Pairs: ${state.matchedPairs}/${state.totalPairs}`,
        variant: 'secondary',
      },
      [componentId('grid')]: {
        id: componentId('grid'),
        type: 'Grid',
        children: cardIds,
        columns,
        gap: 8,
      },
      ...cardComponents,
    } as Record<string, A2UIComponent>,
    dataModel: {
      moves: state.moves,
      matchedPairs: state.matchedPairs,
    },
    meta: { gameType: 'memory', phase: 'playing' },
  };
}

function createResultsScreen(
  componentId: (s: string) => string,
  state: MemoryGameState,
  _config: MemoryGameConfig
): A2UIDocument {
  const efficiency = Math.round((state.totalPairs / state.moves) * 100);
  let resultMessage = '';
  if (efficiency >= 80) resultMessage = 'Amazing memory! Perfect matching!';
  else if (efficiency >= 60) resultMessage = 'Great job! You have good memory!';
  else if (efficiency >= 40) resultMessage = 'Not bad! Keep practicing!';
  else resultMessage = 'Keep trying! Practice makes perfect!';

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('title'), componentId('stats-card'), componentId('actions')],
        crossAxisAlignment: 'center',
        style: { padding: 24, gap: 24 },
      },
      [componentId('title')]: {
        id: componentId('title'),
        type: 'Text',
        content: 'Congratulations!',
        variant: 'h1',
        align: 'center',
      },
      [componentId('stats-card')]: {
        id: componentId('stats-card'),
        type: 'Card',
        children: [
          componentId('icon'),
          componentId('score-display'),
          componentId('stats-row'),
          componentId('message'),
        ],
        style: { padding: 24, width: 300 },
      },
      [componentId('icon')]: {
        id: componentId('icon'),
        type: 'Icon',
        name: 'trophy',
        size: 'xl',
        color: '#eab308',
      },
      [componentId('score-display')]: {
        id: componentId('score-display'),
        type: 'Text',
        content: `${state.score} points`,
        variant: 'h2',
        align: 'center',
      },
      [componentId('stats-row')]: {
        id: componentId('stats-row'),
        type: 'Row',
        children: [componentId('moves-stat'), componentId('pairs-stat')],
        mainAxisAlignment: 'center',
        style: { gap: 24, margin: '16px 0' },
      },
      [componentId('moves-stat')]: {
        id: componentId('moves-stat'),
        type: 'Column',
        children: [componentId('moves-num'), componentId('moves-label')],
      },
      [componentId('moves-num')]: {
        id: componentId('moves-num'),
        type: 'Text',
        content: String(state.moves),
        variant: 'h3',
        align: 'center',
      },
      [componentId('moves-label')]: {
        id: componentId('moves-label'),
        type: 'Text',
        content: 'Moves',
        variant: 'caption',
        align: 'center',
      },
      [componentId('pairs-stat')]: {
        id: componentId('pairs-stat'),
        type: 'Column',
        children: [componentId('pairs-num'), componentId('pairs-label')],
      },
      [componentId('pairs-num')]: {
        id: componentId('pairs-num'),
        type: 'Text',
        content: String(state.matchedPairs),
        variant: 'h3',
        color: 'success',
        align: 'center',
      },
      [componentId('pairs-label')]: {
        id: componentId('pairs-label'),
        type: 'Text',
        content: 'Pairs',
        variant: 'caption',
        align: 'center',
      },
      [componentId('message')]: {
        id: componentId('message'),
        type: 'Text',
        content: resultMessage,
        variant: 'body',
        align: 'center',
      },
      [componentId('actions')]: {
        id: componentId('actions'),
        type: 'Row',
        children: [componentId('play-again-btn')],
        style: { gap: 16 },
      },
      [componentId('play-again-btn')]: {
        id: componentId('play-again-btn'),
        type: 'Button',
        label: 'Play Again',
        variant: 'primary',
        onPress: {
          type: 'custom',
          handler: 'restartGame',
        },
      },
    } as Record<string, A2UIComponent>,
    dataModel: {},
    meta: { gameType: 'memory', phase: 'complete' },
  };
}

// ============================================================================
// Action Processing
// ============================================================================

export function processAction(
  state: MemoryGameState,
  action: GameAction,
  config: MemoryGameConfig
): MemoryGameState {
  switch (action.type) {
    case 'FLIP_CARD': {
      const index = action.payload?.index as number;
      const card = state.cards[index];

      // Can't flip already matched or flipped cards
      if (!card || card.isMatched || state.flippedIndices.includes(index)) {
        return state;
      }

      // Can't flip more than 2 cards
      if (state.flippedIndices.length >= 2) {
        return state;
      }

      const newFlippedIndices = [...state.flippedIndices, index];

      // If this is the second card
      if (newFlippedIndices.length === 2) {
        const [firstIndex, secondIndex] = newFlippedIndices;
        const firstCard = state.cards[firstIndex];
        const secondCard = state.cards[secondIndex];

        // Check for match
        if (firstCard.pairId === secondCard.pairId) {
          // Match found!
          const newCards = state.cards.map((c, i) =>
            i === firstIndex || i === secondIndex
              ? { ...c, isMatched: true }
              : c
          );

          const newMatchedPairs = state.matchedPairs + 1;
          const isComplete = newMatchedPairs === state.totalPairs;

          return {
            ...state,
            cards: newCards,
            flippedIndices: [],
            matchedPairs: newMatchedPairs,
            moves: state.moves + 1,
            score: state.score + 100,
            turn: state.turn + 1,
            status: isComplete ? 'completed' : state.status,
            completedAt: isComplete ? new Date() : undefined,
          };
        } else {
          // No match - cards will be flipped back after a delay
          // For now, just mark them as flipped
          return {
            ...state,
            flippedIndices: newFlippedIndices,
            moves: state.moves + 1,
            turn: state.turn + 1,
          };
        }
      }

      return {
        ...state,
        flippedIndices: newFlippedIndices,
      };
    }

    case 'RESET_FLIPPED': {
      return {
        ...state,
        flippedIndices: [],
      };
    }

    case 'START_GAME': {
      return {
        ...state,
        status: 'in_progress',
        startedAt: new Date(),
      };
    }

    case 'RESTART_GAME': {
      return {
        ...createInitialState(config),
        status: 'in_progress',
        startedAt: new Date(),
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// Completion Check
// ============================================================================

export function isGameComplete(state: MemoryGameState): boolean {
  return state.matchedPairs === state.totalPairs;
}

// ============================================================================
// Template Export
// ============================================================================

export const memoryTemplate: GameTemplate = {
  type: 'memory',
  name: 'Memory Game',
  description: 'Match pairs of cards to test your memory',
  defaultConfig: {
    type: 'memory',
    title: 'Memory Match',
    pairCount: 8,
    cardTheme: 'emoji',
    cards: [],
  },
  initialA2ui: createIntroScreen((s) => `memory-${s}`, {
    type: 'memory',
    title: 'Memory Match',
    pairCount: 8,
    cardTheme: 'emoji',
    cards: [],
  }),
  createInitialState: createInitialState as (config: unknown) => MemoryGameState,
  generateA2ui: generateA2ui as (state: unknown, config: unknown) => A2UIDocument,
  processAction: processAction as (state: unknown, action: GameAction, config: unknown) => MemoryGameState,
  isGameComplete: isGameComplete as (state: unknown) => boolean,
};
