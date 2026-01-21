/**
 * Game Engine
 *
 * Core game state machine that manages game lifecycle,
 * processes actions, and coordinates with templates.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  GameState,
  GameConfig,
  GameAction,
  GameSession,
  GameHistoryEntry,
  GameTemplate,
  GameType,
} from './types';

// ============================================================================
// Game Engine Class
// ============================================================================

export class GameEngine {
  private templates: Map<GameType, GameTemplate> = new Map();
  private currentSession: GameSession | null = null;

  /**
   * Register a game template
   */
  registerTemplate(template: GameTemplate): void {
    this.templates.set(template.type, template);
  }

  /**
   * Get a registered template
   */
  getTemplate(type: GameType): GameTemplate | undefined {
    return this.templates.get(type);
  }

  /**
   * Get all registered template types
   */
  getRegisteredTypes(): GameType[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Start a new game session
   */
  startGame(gameId: string, config: GameConfig): GameSession {
    const template = this.templates.get(config.type);
    if (!template) {
      throw new Error(`No template registered for game type: ${config.type}`);
    }

    const initialState = template.createInitialState(config);
    const initialA2ui = template.generateA2ui(initialState, config);

    const session: GameSession = {
      id: uuidv4(),
      gameId,
      state: {
        ...initialState,
        status: 'in_progress',
        startedAt: new Date(),
      },
      currentA2ui: initialA2ui,
      startedAt: new Date(),
      lastPlayedAt: new Date(),
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Resume an existing game session
   */
  resumeSession(session: GameSession): void {
    this.currentSession = session;
  }

  /**
   * Get the current session
   */
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  /**
   * Process a game action
   */
  processAction(action: Omit<GameAction, 'id' | 'timestamp'>): {
    session: GameSession;
    stateChanged: boolean;
    gameComplete: boolean;
  } {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    const gameType = this.currentSession.state.type;
    const template = this.templates.get(gameType);
    if (!template) {
      throw new Error(`No template for game type: ${gameType}`);
    }

    // Create full action with ID and timestamp
    const fullAction: GameAction = {
      ...action,
      id: uuidv4(),
      timestamp: new Date(),
    };

    // Get config from state (simplified - in real app would fetch from DB)
    const config = this.getConfigFromState(this.currentSession.state);

    // Process the action
    const previousState = this.currentSession.state;
    const newState = template.processAction(previousState, fullAction, config);

    // Add action to history
    newState.history = [...(previousState.history || []), fullAction];

    // Check if game is complete
    const gameComplete = template.isGameComplete(newState);
    if (gameComplete && newState.status !== 'completed') {
      newState.status = 'completed';
      newState.completedAt = new Date();
    }

    // Generate new A2UI
    const newA2ui = template.generateA2ui(newState, config);

    // Update session
    this.currentSession = {
      ...this.currentSession,
      state: newState,
      currentA2ui: newA2ui,
      lastPlayedAt: new Date(),
    };

    const stateChanged = JSON.stringify(previousState) !== JSON.stringify(newState);

    return {
      session: this.currentSession,
      stateChanged,
      gameComplete,
    };
  }

  /**
   * Pause the current game
   */
  pauseGame(): GameSession | null {
    if (this.currentSession) {
      this.currentSession.state.status = 'paused';
      this.currentSession.lastPlayedAt = new Date();
    }
    return this.currentSession;
  }

  /**
   * End the current game
   */
  endGame(): GameHistoryEntry | null {
    if (!this.currentSession) {
      return null;
    }

    const state = this.currentSession.state;
    const historyEntry: GameHistoryEntry = {
      id: uuidv4(),
      gameId: this.currentSession.gameId,
      gameName: `Game ${this.currentSession.gameId}`,
      gameType: state.type,
      finalScore: state.score,
      maxScore: state.maxScore,
      totalTurns: state.turn,
      completedAt: new Date(),
      summary: this.createGameSummary(state),
    };

    this.currentSession = null;
    return historyEntry;
  }

  /**
   * Create a summary of the game for history
   */
  private createGameSummary(state: GameState): Record<string, unknown> {
    const summary: Record<string, unknown> = {
      status: state.status,
      score: state.score,
      turns: state.turn,
    };

    switch (state.type) {
      case 'trivia':
        summary.correctAnswers = state.correctAnswers;
        summary.incorrectAnswers = state.incorrectAnswers;
        summary.totalQuestions = state.questions.length;
        break;
      case 'quiz':
        summary.result = state.result?.title;
        break;
      case 'adventure':
        summary.visitedNodes = state.visitedNodes.length;
        summary.inventory = state.inventory;
        break;
      case 'memory':
        summary.matchedPairs = state.matchedPairs;
        summary.moves = state.moves;
        break;
      case 'tictactoe':
        summary.winner = state.winner;
        break;
      case 'madlibs':
        summary.wordsProvided = Object.keys(state.filledWords).length;
        break;
    }

    return summary;
  }

  /**
   * Extract config from state (simplified)
   */
  private getConfigFromState(state: GameState): GameConfig {
    // This is a simplified version - in production, config would be stored separately
    const baseConfig = {
      title: 'Game',
      type: state.type,
    };

    switch (state.type) {
      case 'trivia':
        return {
          ...baseConfig,
          type: 'trivia',
          questionCount: state.questions.length,
          showExplanations: true,
        };
      case 'quiz':
        return {
          ...baseConfig,
          type: 'quiz',
          personality: 'default',
          results: state.result ? [state.result] : [],
        };
      case 'adventure':
        return {
          ...baseConfig,
          type: 'adventure',
          startNodeId: Object.keys(state.nodes)[0] || 'start',
        };
      case 'memory':
        return {
          ...baseConfig,
          type: 'memory',
          pairCount: state.totalPairs,
          cardTheme: 'emoji' as const,
          cards: state.cards.map((c) => ({ content: c.content, pairId: c.pairId })),
        };
      case 'tictactoe':
        return {
          ...baseConfig,
          type: 'tictactoe',
          playerFirst: state.playerSymbol === 'X',
          aiDifficulty: state.aiDifficulty,
        };
      case 'madlibs':
        return {
          ...baseConfig,
          type: 'madlibs',
          storyTemplate: state.storyTemplate,
          prompts: state.prompts,
        };
      default:
        return {
          ...baseConfig,
          type: 'custom',
          customConfig: {},
        };
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let gameEngineInstance: GameEngine | null = null;

export function getGameEngine(): GameEngine {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
  }
  return gameEngineInstance;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate score percentage
 */
export function calculateScorePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Format game duration
 */
export function formatGameDuration(startedAt: Date, endedAt: Date): string {
  const durationMs = endedAt.getTime() - startedAt.getTime();
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return uuidv4();
}
