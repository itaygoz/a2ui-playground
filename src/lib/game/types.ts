/**
 * Game Engine Types
 *
 * Types for the game state machine and game-specific configurations.
 */

import type { A2UIDocument } from '@/lib/a2ui/types';

// ============================================================================
// Core Game Types
// ============================================================================

export type GameType = 'trivia' | 'quiz' | 'adventure' | 'memory' | 'tictactoe' | 'madlibs' | 'custom';

export type GameStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed';

export interface GameMetadata {
  id: string;
  name: string;
  description?: string;
  type: GameType;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Game State
// ============================================================================

export interface BaseGameState {
  status: GameStatus;
  currentPhase: string;
  score: number;
  maxScore?: number;
  turn: number;
  maxTurns?: number;
  startedAt?: Date;
  completedAt?: Date;
  history: GameAction[];
}

export interface TriviaGameState extends BaseGameState {
  type: 'trivia';
  currentQuestionIndex: number;
  questions: TriviaQuestion[];
  correctAnswers: number;
  incorrectAnswers: number;
  selectedAnswer?: string;
  showingResult: boolean;
}

export interface QuizGameState extends BaseGameState {
  type: 'quiz';
  currentQuestionIndex: number;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  result?: QuizResult;
}

export interface AdventureGameState extends BaseGameState {
  type: 'adventure';
  currentNodeId: string;
  nodes: Record<string, StoryNode>;
  visitedNodes: string[];
  inventory: string[];
  flags: Record<string, boolean>;
  endings: string[];
}

export interface MemoryGameState extends BaseGameState {
  type: 'memory';
  cards: MemoryCard[];
  flippedIndices: number[];
  matchedPairs: number;
  totalPairs: number;
  moves: number;
}

export interface TicTacToeGameState extends BaseGameState {
  type: 'tictactoe';
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
  winner?: 'X' | 'O' | 'draw';
  playerSymbol: 'X' | 'O';
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

export interface MadLibsGameState extends BaseGameState {
  type: 'madlibs';
  prompts: MadLibsPrompt[];
  currentPromptIndex: number;
  filledWords: Record<string, string>;
  story: string;
  storyTemplate: string;
}

export interface CustomGameState extends BaseGameState {
  type: 'custom';
  data: Record<string, unknown>;
}

export type GameState =
  | TriviaGameState
  | QuizGameState
  | AdventureGameState
  | MemoryGameState
  | TicTacToeGameState
  | MadLibsGameState
  | CustomGameState;

// ============================================================================
// Game-Specific Types
// ============================================================================

// Trivia Types
export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  type: 'single' | 'multiple';
}

export interface QuizOption {
  id: string;
  text: string;
  value: string;
}

export interface QuizResult {
  title: string;
  description: string;
  image?: string;
  traits: Record<string, number>;
}

// Adventure Types
export interface StoryNode {
  id: string;
  title?: string;
  content: string;
  choices: StoryChoice[];
  image?: string;
  isEnding?: boolean;
  endingType?: 'good' | 'bad' | 'neutral';
  effects?: StoryEffect[];
}

export interface StoryChoice {
  id: string;
  text: string;
  targetNodeId: string;
  condition?: StoryCondition;
  effects?: StoryEffect[];
}

export interface StoryCondition {
  type: 'hasItem' | 'hasFlag' | 'visitedNode' | 'custom';
  value: string;
  negate?: boolean;
}

export interface StoryEffect {
  type: 'addItem' | 'removeItem' | 'setFlag' | 'addScore' | 'custom';
  key: string;
  value?: unknown;
}

// Memory Types
export interface MemoryCard {
  id: string;
  content: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// MadLibs Types
export interface MadLibsPrompt {
  id: string;
  label: string;
  type: 'noun' | 'verb' | 'adjective' | 'adverb' | 'name' | 'place' | 'number' | 'custom';
  placeholder?: string;
}

// ============================================================================
// Game Actions
// ============================================================================

export interface GameAction {
  id: string;
  type: string;
  payload?: Record<string, unknown>;
  timestamp: Date;
}

export interface TriviaAction extends GameAction {
  type: 'SELECT_ANSWER' | 'NEXT_QUESTION' | 'START_GAME' | 'END_GAME';
}

export interface QuizAction extends GameAction {
  type: 'SELECT_OPTION' | 'NEXT_QUESTION' | 'CALCULATE_RESULT' | 'START_GAME';
}

export interface AdventureAction extends GameAction {
  type: 'MAKE_CHOICE' | 'START_GAME' | 'RESTART';
}

export interface MemoryAction extends GameAction {
  type: 'FLIP_CARD' | 'CHECK_MATCH' | 'START_GAME' | 'RESET_GAME';
}

export interface TicTacToeAction extends GameAction {
  type: 'MAKE_MOVE' | 'AI_MOVE' | 'START_GAME' | 'RESTART';
}

export interface MadLibsAction extends GameAction {
  type: 'FILL_WORD' | 'NEXT_PROMPT' | 'GENERATE_STORY' | 'START_GAME';
}

// ============================================================================
// Game Configuration
// ============================================================================

export interface BaseGameConfig {
  type: GameType;
  title: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface TriviaGameConfig extends BaseGameConfig {
  type: 'trivia';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  timePerQuestion?: number; // seconds, 0 = no limit
  showExplanations: boolean;
}

export interface QuizGameConfig extends BaseGameConfig {
  type: 'quiz';
  personality: string;
  results: QuizResult[];
}

export interface AdventureGameConfig extends BaseGameConfig {
  type: 'adventure';
  startNodeId: string;
  genre?: string;
  estimatedPlayTime?: number; // minutes
}

export interface MemoryGameConfig extends BaseGameConfig {
  type: 'memory';
  pairCount: number;
  cardTheme: 'emoji' | 'images' | 'text' | 'custom';
  cards: { content: string; pairId: string }[];
}

export interface TicTacToeGameConfig extends BaseGameConfig {
  type: 'tictactoe';
  playerFirst: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard';
}

export interface MadLibsGameConfig extends BaseGameConfig {
  type: 'madlibs';
  storyTemplate: string;
  prompts: MadLibsPrompt[];
}

export interface CustomGameConfig extends BaseGameConfig {
  type: 'custom';
  customConfig: Record<string, unknown>;
}

export type GameConfig =
  | TriviaGameConfig
  | QuizGameConfig
  | AdventureGameConfig
  | MemoryGameConfig
  | TicTacToeGameConfig
  | MadLibsGameConfig
  | CustomGameConfig;

// ============================================================================
// Game Session
// ============================================================================

export interface GameSession {
  id: string;
  gameId: string;
  state: GameState;
  currentA2ui: A2UIDocument;
  startedAt: Date;
  lastPlayedAt: Date;
}

// ============================================================================
// Game History Entry
// ============================================================================

export interface GameHistoryEntry {
  id: string;
  gameId?: string;
  gameName: string;
  gameType: GameType;
  finalScore?: number;
  maxScore?: number;
  totalTurns?: number;
  completedAt: Date;
  summary?: Record<string, unknown>;
}

// ============================================================================
// Game Template
// ============================================================================

export interface GameTemplate {
  type: GameType;
  name: string;
  description: string;
  defaultConfig: GameConfig;
  initialA2ui: A2UIDocument;
  createInitialState: (config: GameConfig) => GameState;
  generateA2ui: (state: GameState, config: GameConfig) => A2UIDocument;
  processAction: (state: GameState, action: GameAction, config: GameConfig) => GameState;
  isGameComplete: (state: GameState) => boolean;
}
