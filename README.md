# A2UI Playground

Interactive AI-powered UI playground with game creation capabilities.

## Features

- **AI Chat**: Generate A2UI interfaces from natural language prompts
- **Live Editor**: Monaco-powered JSON editor with real-time preview
- **Component Palette**: Drag-and-drop UI components
- **Game Engine**: Create and play Trivia, Memory, Tic-Tac-Toe, Adventure games
- **Game Library**: Save, edit, and replay games (no login required)

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1 (Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Radix UI, Tailwind CSS 4 |
| State | Zustand 5 |
| Database | PostgreSQL 16 + Drizzle ORM |
| AI | Claude API (Anthropic SDK) |
| Editor | Monaco Editor |
| DnD | @dnd-kit |

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Anthropic API key

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start PostgreSQL: `npm run docker:up`
4. Push database schema: `npm run db:push`
5. Create `.env.local` with your `ANTHROPIC_API_KEY`
6. Start dev server: `npm run dev`
7. Open http://localhost:3000

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run docker:up` | Start PostgreSQL container |
| `npm run docker:down` | Stop PostgreSQL container |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project Structure

```
src/
├── app/
│   ├── api/          # API routes (chat, games, sessions)
│   ├── page.tsx      # Main entry
│   └── layout.tsx    # Root layout
├── components/
│   ├── a2ui/         # A2UI renderer & components
│   ├── chat/         # AI chat interface
│   ├── editor/       # Monaco JSON editor
│   ├── preview/      # Live preview
│   ├── palette/      # Component palette (DnD)
│   ├── library/      # Game library sidebar
│   └── ui/           # shadcn/ui components
├── db/               # Drizzle ORM setup
├── lib/
│   ├── a2ui/         # A2UI types & utilities
│   ├── ai/           # Claude integration
│   └── game/         # Game engine & templates
└── stores/           # Zustand state
```

## License

MIT
