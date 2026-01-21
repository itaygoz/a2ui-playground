/**
 * Tic-Tac-Toe Game Template
 *
 * Classic tic-tac-toe game against AI.
 */

import type {
  GameTemplate,
  TicTacToeGameState,
  TicTacToeGameConfig,
  GameAction,
} from '../types';
import type { A2UIDocument, A2UIComponent } from '@/lib/a2ui/types';

// ============================================================================
// Initial State
// ============================================================================

export function createInitialState(config: TicTacToeGameConfig): TicTacToeGameState {
  return {
    type: 'tictactoe',
    status: 'not_started',
    currentPhase: 'playing',
    score: 0,
    maxScore: 100,
    turn: 0,
    maxTurns: 9,
    history: [],
    board: Array(9).fill(null),
    currentPlayer: config.playerFirst ? 'X' : 'O',
    playerSymbol: config.playerFirst ? 'X' : 'O',
    aiDifficulty: config.aiDifficulty,
  };
}

// ============================================================================
// A2UI Generation
// ============================================================================

export function generateA2ui(state: TicTacToeGameState, config: TicTacToeGameConfig): A2UIDocument {
  const componentId = (suffix: string) => `ttt-${suffix}`;

  if (state.status === 'not_started') {
    return createIntroScreen(componentId, config);
  }

  if (state.status === 'completed' || state.winner) {
    return createResultsScreen(componentId, state, config);
  }

  return createGameScreen(componentId, state, config);
}

function createIntroScreen(
  componentId: (s: string) => string,
  config: TicTacToeGameConfig
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
        content: config.title || 'Tic-Tac-Toe',
        variant: 'h1',
        align: 'center',
      },
      [componentId('description')]: {
        id: componentId('description'),
        type: 'Text',
        content: config.description || `Play against the AI (${config.aiDifficulty} mode)`,
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
    meta: { gameType: 'tictactoe', phase: 'intro' },
  };
}

function createGameScreen(
  componentId: (s: string) => string,
  state: TicTacToeGameState,
  _config: TicTacToeGameConfig
): A2UIDocument {
  const cellComponents: Record<string, A2UIComponent> = {};
  const cellIds: string[] = [];

  const isPlayerTurn = state.currentPlayer === state.playerSymbol;

  state.board.forEach((cell, index) => {
    const cellId = componentId(`cell-${index}`);
    cellIds.push(cellId);

    cellComponents[cellId] = {
      id: cellId,
      type: 'Button',
      label: cell || ' ',
      variant: cell === 'X' ? 'default' : cell === 'O' ? 'secondary' : 'outline',
      disabled: cell !== null || !isPlayerTurn,
      style: {
        width: 80,
        height: 80,
        fontSize: 32,
        fontWeight: 'bold',
      },
      onPress: {
        type: 'custom',
        handler: 'makeMove',
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
        children: [componentId('header'), componentId('grid'), componentId('turn-indicator')],
        crossAxisAlignment: 'center',
        style: { padding: 24, gap: 24 },
      },
      [componentId('header')]: {
        id: componentId('header'),
        type: 'Row',
        children: [componentId('player-badge'), componentId('vs'), componentId('ai-badge')],
        crossAxisAlignment: 'center',
        style: { gap: 16 },
      },
      [componentId('player-badge')]: {
        id: componentId('player-badge'),
        type: 'Badge',
        content: `You: ${state.playerSymbol}`,
        variant: isPlayerTurn ? 'default' : 'outline',
      },
      [componentId('vs')]: {
        id: componentId('vs'),
        type: 'Text',
        content: 'vs',
        variant: 'caption',
      },
      [componentId('ai-badge')]: {
        id: componentId('ai-badge'),
        type: 'Badge',
        content: `AI: ${state.playerSymbol === 'X' ? 'O' : 'X'}`,
        variant: !isPlayerTurn ? 'default' : 'outline',
      },
      [componentId('grid')]: {
        id: componentId('grid'),
        type: 'Grid',
        children: cellIds,
        columns: 3,
        gap: 4,
      },
      ...cellComponents,
      [componentId('turn-indicator')]: {
        id: componentId('turn-indicator'),
        type: 'Text',
        content: isPlayerTurn ? 'Your turn!' : 'AI is thinking...',
        variant: 'body',
        align: 'center',
        color: 'secondary',
      },
    } as Record<string, A2UIComponent>,
    dataModel: {
      currentPlayer: state.currentPlayer,
      isPlayerTurn,
    },
    meta: { gameType: 'tictactoe', phase: 'playing' },
  };
}

function createResultsScreen(
  componentId: (s: string) => string,
  state: TicTacToeGameState,
  _config: TicTacToeGameConfig
): A2UIDocument {
  const playerWon = state.winner === state.playerSymbol;
  const isDraw = state.winner === 'draw';

  let title = '';
  let message = '';
  let iconName = '';
  let iconColor = '';

  if (isDraw) {
    title = "It's a Draw!";
    message = 'Well played! Neither side could win.';
    iconName = 'equal';
    iconColor = '#6b7280';
  } else if (playerWon) {
    title = 'You Win!';
    message = 'Congratulations! You beat the AI!';
    iconName = 'trophy';
    iconColor = '#eab308';
  } else {
    title = 'AI Wins!';
    message = 'Better luck next time!';
    iconName = 'bot';
    iconColor = '#3b82f6';
  }

  // Create the final board display
  const cellComponents: Record<string, A2UIComponent> = {};
  const cellIds: string[] = [];

  state.board.forEach((cell, index) => {
    const cellId = componentId(`final-cell-${index}`);
    cellIds.push(cellId);

    cellComponents[cellId] = {
      id: cellId,
      type: 'Button',
      label: cell || ' ',
      variant: cell === 'X' ? 'default' : cell === 'O' ? 'secondary' : 'outline',
      disabled: true,
      style: {
        width: 60,
        height: 60,
        fontSize: 24,
        fontWeight: 'bold',
      },
      onPress: { type: 'custom', handler: 'noop' }, // Required but disabled
    };
  });

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('result-card'), componentId('final-board'), componentId('actions')],
        crossAxisAlignment: 'center',
        style: { padding: 24, gap: 24 },
      },
      [componentId('result-card')]: {
        id: componentId('result-card'),
        type: 'Card',
        children: [componentId('icon'), componentId('title'), componentId('message')],
        style: { padding: 24, width: 280 },
      },
      [componentId('icon')]: {
        id: componentId('icon'),
        type: 'Icon',
        name: iconName,
        size: 'xl',
        color: iconColor,
      },
      [componentId('title')]: {
        id: componentId('title'),
        type: 'Text',
        content: title,
        variant: 'h2',
        align: 'center',
      },
      [componentId('message')]: {
        id: componentId('message'),
        type: 'Text',
        content: message,
        variant: 'body',
        align: 'center',
        color: 'secondary',
      },
      [componentId('final-board')]: {
        id: componentId('final-board'),
        type: 'Grid',
        children: cellIds,
        columns: 3,
        gap: 4,
      },
      ...cellComponents,
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
    meta: { gameType: 'tictactoe', phase: 'complete' },
  };
}

// ============================================================================
// AI Logic
// ============================================================================

function getAIMove(board: (string | null)[], difficulty: 'easy' | 'medium' | 'hard', aiSymbol: string): number {
  const playerSymbol = aiSymbol === 'X' ? 'O' : 'X';
  const availableMoves = board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);

  if (availableMoves.length === 0) return -1;

  // Easy: Random move
  if (difficulty === 'easy') {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // Medium: Sometimes optimal, sometimes random
  if (difficulty === 'medium') {
    if (Math.random() < 0.4) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  // Hard/Medium (when not random): Use minimax
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    const newBoard = [...board];
    newBoard[move] = aiSymbol;
    const score = minimax(newBoard, 0, false, aiSymbol, playerSymbol, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  board: (string | null)[],
  depth: number,
  isMaximizing: boolean,
  aiSymbol: string,
  playerSymbol: string,
  alpha: number,
  beta: number
): number {
  const winner = checkWinner(board);
  if (winner === aiSymbol) return 10 - depth;
  if (winner === playerSymbol) return depth - 10;
  if (winner === 'draw') return 0;

  const availableMoves = board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = aiSymbol;
      const score = minimax(newBoard, depth + 1, false, aiSymbol, playerSymbol, alpha, beta);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxScore;
  } else {
    let minScore = Infinity;
    for (const move of availableMoves) {
      const newBoard = [...board];
      newBoard[move] = playerSymbol;
      const score = minimax(newBoard, depth + 1, true, aiSymbol, playerSymbol, alpha, beta);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minScore;
  }
}

function checkWinner(board: (string | null)[]): string | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6], // Diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  // Check for draw
  if (board.every((cell) => cell !== null)) {
    return 'draw';
  }

  return null;
}

// ============================================================================
// Action Processing
// ============================================================================

export function processAction(
  state: TicTacToeGameState,
  action: GameAction,
  config: TicTacToeGameConfig
): TicTacToeGameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      const index = action.payload?.index as number;

      // Validate move
      if (state.board[index] !== null || state.winner) {
        return state;
      }

      // Make player move
      const newBoard = [...state.board];
      newBoard[index] = state.playerSymbol;

      // Check for winner after player move
      const winnerAfterPlayer = checkWinner(newBoard);
      if (winnerAfterPlayer) {
        return {
          ...state,
          board: newBoard,
          winner: winnerAfterPlayer as 'X' | 'O' | 'draw',
          status: 'completed',
          score: winnerAfterPlayer === state.playerSymbol ? 100 : 0,
          turn: state.turn + 1,
          completedAt: new Date(),
        };
      }

      // AI makes move
      const aiSymbol = state.playerSymbol === 'X' ? 'O' : 'X';
      const aiMove = getAIMove(newBoard, state.aiDifficulty, aiSymbol);

      if (aiMove !== -1) {
        newBoard[aiMove] = aiSymbol;
      }

      // Check for winner after AI move
      const winnerAfterAI = checkWinner(newBoard);
      if (winnerAfterAI) {
        return {
          ...state,
          board: newBoard,
          winner: winnerAfterAI as 'X' | 'O' | 'draw',
          status: 'completed',
          score: winnerAfterAI === state.playerSymbol ? 100 : 0,
          turn: state.turn + 1,
          completedAt: new Date(),
        };
      }

      return {
        ...state,
        board: newBoard,
        turn: state.turn + 1,
      };
    }

    case 'START_GAME': {
      let newState: TicTacToeGameState = {
        ...state,
        status: 'in_progress',
        startedAt: new Date(),
      };

      // If AI goes first, make AI move
      if (!config.playerFirst) {
        const aiSymbol = state.playerSymbol === 'X' ? 'O' : 'X';
        const aiMove = getAIMove(state.board, state.aiDifficulty, aiSymbol);
        if (aiMove !== -1) {
          const newBoard = [...state.board];
          newBoard[aiMove] = aiSymbol;
          newState = {
            ...newState,
            board: newBoard,
          };
        }
      }

      return newState;
    }

    case 'RESTART_GAME': {
      const initial = createInitialState(config);
      let newState: TicTacToeGameState = {
        ...initial,
        status: 'in_progress',
        startedAt: new Date(),
      };

      // If AI goes first, make AI move
      if (!config.playerFirst) {
        const aiSymbol = initial.playerSymbol === 'X' ? 'O' : 'X';
        const aiMove = getAIMove(initial.board, initial.aiDifficulty, aiSymbol);
        if (aiMove !== -1) {
          const newBoard = [...initial.board];
          newBoard[aiMove] = aiSymbol;
          newState = {
            ...newState,
            board: newBoard,
          };
        }
      }

      return newState;
    }

    default:
      return state;
  }
}

// ============================================================================
// Completion Check
// ============================================================================

export function isGameComplete(state: TicTacToeGameState): boolean {
  return state.winner !== undefined;
}

// ============================================================================
// Template Export
// ============================================================================

export const tictactoeTemplate: GameTemplate = {
  type: 'tictactoe',
  name: 'Tic-Tac-Toe',
  description: 'Classic tic-tac-toe game against AI',
  defaultConfig: {
    type: 'tictactoe',
    title: 'Tic-Tac-Toe',
    playerFirst: true,
    aiDifficulty: 'medium',
  },
  initialA2ui: createIntroScreen((s) => `ttt-${s}`, {
    type: 'tictactoe',
    title: 'Tic-Tac-Toe',
    playerFirst: true,
    aiDifficulty: 'medium',
  }),
  createInitialState: createInitialState as (config: unknown) => TicTacToeGameState,
  generateA2ui: generateA2ui as (state: unknown, config: unknown) => A2UIDocument,
  processAction: processAction as (state: unknown, action: GameAction, config: unknown) => TicTacToeGameState,
  isGameComplete: isGameComplete as (state: unknown) => boolean,
};
