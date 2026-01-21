import { pgTable, uuid, text, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';

// Saved games (the templates/definitions)
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'trivia' | 'quiz' | 'adventure' | 'memory' | 'tictactoe' | 'custom'
  thumbnail: text('thumbnail'), // Base64 or URL
  a2uiTemplate: jsonb('a2ui_template').notNull(), // Initial A2UI JSON
  gameConfig: jsonb('game_config').notNull(), // Game-specific settings
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Game play sessions (active games in progress)
export const gameSessions = pgTable('game_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'cascade' }),
  currentState: jsonb('current_state').notNull(), // GameState
  currentA2ui: jsonb('current_a2ui').notNull(), // Current A2UI render
  startedAt: timestamp('started_at').defaultNow(),
  lastPlayedAt: timestamp('last_played_at').defaultNow(),
});

// Game history (completed games for stats)
export const gameHistory = pgTable('game_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id').references(() => games.id, { onDelete: 'set null' }),
  gameName: text('game_name').notNull(), // Denormalized for history
  finalScore: integer('final_score'),
  totalTurns: integer('total_turns'),
  completedAt: timestamp('completed_at').defaultNow(),
  summary: jsonb('summary'), // Game-specific summary data
});

// Type exports for use in the application
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type GameSession = typeof gameSessions.$inferSelect;
export type NewGameSession = typeof gameSessions.$inferInsert;
export type GameHistoryRecord = typeof gameHistory.$inferSelect;
export type NewGameHistoryRecord = typeof gameHistory.$inferInsert;
