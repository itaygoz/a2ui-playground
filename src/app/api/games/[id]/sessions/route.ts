import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games, gameSessions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/games/[id]/sessions
 * List all sessions for a game
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const sessions = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.gameId, id))
      .orderBy(desc(gameSessions.lastPlayedAt));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/[id]/sessions
 * Start a new game session
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get the game
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.id, id))
      .limit(1);

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Create initial session state based on game type
    const initialState = createInitialState(game.type, game.gameConfig);

    const [newSession] = await db
      .insert(gameSessions)
      .values({
        gameId: id,
        currentState: initialState,
        currentA2ui: game.a2uiTemplate,
      })
      .returning();

    return NextResponse.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * Create initial game state based on type
 */
function createInitialState(type: string, _config: unknown): Record<string, unknown> {
  const baseState = {
    status: 'in_progress',
    currentPhase: 'playing',
    score: 0,
    turn: 0,
    history: [],
    startedAt: new Date().toISOString(),
  };

  switch (type) {
    case 'trivia':
      return {
        ...baseState,
        type: 'trivia',
        currentQuestionIndex: 0,
        questions: [],
        correctAnswers: 0,
        incorrectAnswers: 0,
        showingResult: false,
      };

    case 'memory':
      return {
        ...baseState,
        type: 'memory',
        cards: [],
        flippedIndices: [],
        matchedPairs: 0,
        totalPairs: 0,
        moves: 0,
      };

    case 'tictactoe':
      return {
        ...baseState,
        type: 'tictactoe',
        board: Array(9).fill(null),
        currentPlayer: 'X',
        playerSymbol: 'X',
        aiDifficulty: 'medium',
      };

    case 'adventure':
      return {
        ...baseState,
        type: 'adventure',
        currentNodeId: 'start',
        nodes: {},
        visitedNodes: ['start'],
        inventory: [],
        flags: {},
        endings: [],
      };

    default:
      return {
        ...baseState,
        type: 'custom',
        data: {},
      };
  }
}
