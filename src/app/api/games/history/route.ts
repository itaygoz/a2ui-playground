import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameHistory } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * GET /api/games/history
 * Get game play history
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const history = await db
      .select()
      .from(gameHistory)
      .orderBy(desc(gameHistory.completedAt))
      .limit(limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/history
 * Add a new history entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, gameName, finalScore, totalTurns, summary } = body;

    if (!gameName) {
      return NextResponse.json(
        { error: 'Missing required field: gameName' },
        { status: 400 }
      );
    }

    const [entry] = await db
      .insert(gameHistory)
      .values({
        gameId,
        gameName,
        finalScore,
        totalTurns,
        summary,
      })
      .returning();

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Failed to create history entry:', error);
    return NextResponse.json(
      { error: 'Failed to create history entry' },
      { status: 500 }
    );
  }
}
