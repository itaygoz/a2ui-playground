import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string; sessionId: string }>;
}

/**
 * GET /api/games/[id]/sessions/[sessionId]
 * Get a specific session
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sessionId } = await params;

    const [session] = await db
      .select()
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.id, sessionId),
          eq(gameSessions.gameId, id)
        )
      )
      .limit(1);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/games/[id]/sessions/[sessionId]
 * Update a session (save progress)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sessionId } = await params;
    const body = await request.json();
    const { currentState, currentA2ui } = body;

    const updateData: Record<string, unknown> = {
      lastPlayedAt: new Date(),
    };

    if (currentState !== undefined) updateData.currentState = currentState;
    if (currentA2ui !== undefined) updateData.currentA2ui = currentA2ui;

    const [updatedSession] = await db
      .update(gameSessions)
      .set(updateData)
      .where(
        and(
          eq(gameSessions.id, sessionId),
          eq(gameSessions.gameId, id)
        )
      )
      .returning();

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/games/[id]/sessions/[sessionId]
 * Delete a session
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, sessionId } = await params;

    const [deletedSession] = await db
      .delete(gameSessions)
      .where(
        and(
          eq(gameSessions.id, sessionId),
          eq(gameSessions.gameId, id)
        )
      )
      .returning();

    if (!deletedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, session: deletedSession });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
