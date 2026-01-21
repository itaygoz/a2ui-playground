import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { games } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const runtime = 'nodejs';

/**
 * GET /api/games
 * List all saved games
 */
export async function GET(_request: NextRequest) {
  try {
    const allGames = await db
      .select()
      .from(games)
      .orderBy(desc(games.updatedAt));

    return NextResponse.json({ games: allGames });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games
 * Create a new game
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, thumbnail, a2uiTemplate, gameConfig } = body;

    if (!name || !type || !a2uiTemplate || !gameConfig) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, a2uiTemplate, gameConfig' },
        { status: 400 }
      );
    }

    const [newGame] = await db
      .insert(games)
      .values({
        name,
        description,
        type,
        thumbnail,
        a2uiTemplate,
        gameConfig,
      })
      .returning();

    return NextResponse.json({ game: newGame }, { status: 201 });
  } catch (error) {
    console.error('Failed to create game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
