/**
 * AI Game Master
 *
 * Integrates with Claude AI to generate game content dynamically.
 * Handles trivia questions, adventure stories, quiz results, etc.
 */

import type {
  GameType,
  TriviaQuestion,
  StoryNode,
  QuizQuestion,
  QuizResult,
} from './types';

// ============================================================================
// Game Content Generation Prompts
// ============================================================================

const TRIVIA_GENERATION_PROMPT = `You are a trivia game master. Generate trivia questions based on the user's request.

Return a JSON array of trivia questions in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "correctAnswer": "Paris",
      "explanation": "Paris has been the capital of France since 987 AD.",
      "category": "Geography",
      "difficulty": "easy"
    }
  ]
}

Rules:
- Generate exactly the number of questions requested
- Always have 4 options per question
- correctAnswer must exactly match one of the options
- Keep questions engaging and educational
- Mix difficulty if not specified
- Include brief explanations for learning`;

const ADVENTURE_GENERATION_PROMPT = `You are an interactive fiction author. Create a choose-your-own-adventure story.

Return a JSON object with story nodes in this exact format:
{
  "nodes": {
    "start": {
      "id": "start",
      "title": "The Beginning",
      "content": "You wake up in a dark forest...",
      "choices": [
        {
          "id": "c1",
          "text": "Follow the path north",
          "targetNodeId": "path_north"
        },
        {
          "id": "c2",
          "text": "Stay and investigate",
          "targetNodeId": "investigate"
        }
      ],
      "isEnding": false
    },
    "ending_good": {
      "id": "ending_good",
      "title": "Victory!",
      "content": "You have succeeded...",
      "choices": [],
      "isEnding": true,
      "endingType": "good"
    }
  }
}

Rules:
- Start with a node id "start"
- Each node needs 2-4 meaningful choices (except endings)
- Include at least 2 different endings (good, bad, or neutral)
- Create an immersive, branching narrative
- Use effects for inventory items and story flags when appropriate
- Make choices meaningful and impactful`;

const QUIZ_GENERATION_PROMPT = `You are a personality quiz creator. Create an engaging personality quiz.

Return a JSON object in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "How do you prefer to spend your weekends?",
      "options": [
        { "id": "a", "text": "Outdoor adventures", "value": "adventurous" },
        { "id": "b", "text": "Reading at home", "value": "intellectual" },
        { "id": "c", "text": "Social gatherings", "value": "social" },
        { "id": "d", "text": "Creative projects", "value": "creative" }
      ],
      "type": "single"
    }
  ],
  "results": [
    {
      "title": "The Adventurer",
      "description": "You thrive on excitement and new experiences...",
      "traits": { "adventurous": 3, "social": 1 }
    }
  ]
}

Rules:
- Create engaging, thoughtful questions
- Each option should map to a personality trait
- Provide 3-5 distinct result types
- Make results positive and insightful`;

// ============================================================================
// Content Generation Functions
// ============================================================================

export interface GenerateTriviaOptions {
  topic: string;
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface GenerateAdventureOptions {
  theme: string;
  genre?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface GenerateQuizOptions {
  topic: string;
  questionCount: number;
}

/**
 * Generate trivia questions using AI
 */
export async function generateTriviaQuestions(
  options: GenerateTriviaOptions
): Promise<TriviaQuestion[]> {
  const prompt = `${TRIVIA_GENERATION_PROMPT}

Generate ${options.questionCount} trivia questions about: ${options.topic}
${options.difficulty ? `Difficulty: ${options.difficulty}` : 'Mix of difficulties'}

Return ONLY valid JSON, no other text.`;

  const response = await callGameMasterAPI(prompt);

  try {
    const parsed = JSON.parse(response);
    return parsed.questions || [];
  } catch (error) {
    console.error('Failed to parse trivia questions:', error);
    return getDefaultTriviaQuestions(options.questionCount);
  }
}

/**
 * Generate adventure story nodes using AI
 */
export async function generateAdventureStory(
  options: GenerateAdventureOptions
): Promise<Record<string, StoryNode>> {
  const lengthGuide = {
    short: '5-8 nodes',
    medium: '10-15 nodes',
    long: '20-30 nodes',
  };

  const prompt = `${ADVENTURE_GENERATION_PROMPT}

Create an adventure story with theme: ${options.theme}
${options.genre ? `Genre: ${options.genre}` : ''}
Length: ${lengthGuide[options.length || 'medium']}

Return ONLY valid JSON, no other text.`;

  const response = await callGameMasterAPI(prompt);

  try {
    const parsed = JSON.parse(response);
    return parsed.nodes || {};
  } catch (error) {
    console.error('Failed to parse adventure story:', error);
    return getDefaultAdventureNodes();
  }
}

/**
 * Generate personality quiz using AI
 */
export async function generateQuiz(
  options: GenerateQuizOptions
): Promise<{ questions: QuizQuestion[]; results: QuizResult[] }> {
  const prompt = `${QUIZ_GENERATION_PROMPT}

Create a personality quiz about: ${options.topic}
Number of questions: ${options.questionCount}

Return ONLY valid JSON, no other text.`;

  const response = await callGameMasterAPI(prompt);

  try {
    const parsed = JSON.parse(response);
    return {
      questions: parsed.questions || [],
      results: parsed.results || [],
    };
  } catch (error) {
    console.error('Failed to parse quiz:', error);
    return { questions: [], results: [] };
  }
}

// ============================================================================
// API Integration
// ============================================================================

async function callGameMasterAPI(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/game-master', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error('Game Master API error:', error);
    throw error;
  }
}

// ============================================================================
// Default/Fallback Content
// ============================================================================

function getDefaultTriviaQuestions(count: number): TriviaQuestion[] {
  const defaultQuestions: TriviaQuestion[] = [
    {
      id: 'default-1',
      question: 'What is the largest planet in our solar system?',
      options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 'Jupiter',
      explanation: 'Jupiter is the largest planet, with a mass more than twice that of all other planets combined.',
      category: 'Science',
      difficulty: 'easy',
    },
    {
      id: 'default-2',
      question: 'Which element has the chemical symbol "O"?',
      options: ['Gold', 'Oxygen', 'Osmium', 'Oganesson'],
      correctAnswer: 'Oxygen',
      explanation: 'Oxygen is represented by the symbol O on the periodic table.',
      category: 'Science',
      difficulty: 'easy',
    },
    {
      id: 'default-3',
      question: 'In what year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: '1945',
      explanation: 'World War II ended in 1945 with the surrender of Japan.',
      category: 'History',
      difficulty: 'medium',
    },
    {
      id: 'default-4',
      question: 'What is the capital of Japan?',
      options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'],
      correctAnswer: 'Tokyo',
      explanation: 'Tokyo has been the capital of Japan since 1868.',
      category: 'Geography',
      difficulty: 'easy',
    },
    {
      id: 'default-5',
      question: 'Who painted the Mona Lisa?',
      options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
      correctAnswer: 'Leonardo da Vinci',
      explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.',
      category: 'Art',
      difficulty: 'easy',
    },
  ];

  return defaultQuestions.slice(0, count);
}

function getDefaultAdventureNodes(): Record<string, StoryNode> {
  return {
    start: {
      id: 'start',
      title: 'The Beginning',
      content: 'You find yourself at the entrance of a mysterious cave. The wind howls from within, carrying whispers of ancient secrets. A faded map lies at your feet.',
      choices: [
        {
          id: 'c1',
          text: 'Enter the cave',
          targetNodeId: 'cave_entrance',
        },
        {
          id: 'c2',
          text: 'Pick up the map first',
          targetNodeId: 'pick_map',
          effects: [{ type: 'addItem', key: 'Ancient Map' }],
        },
      ],
    },
    pick_map: {
      id: 'pick_map',
      title: 'The Ancient Map',
      content: 'You pick up the weathered map. It shows the cave system with a treasure chamber marked deep within. You also notice warnings about traps.',
      choices: [
        {
          id: 'c3',
          text: 'Enter the cave with the map',
          targetNodeId: 'cave_entrance',
        },
      ],
      effects: [{ type: 'addScore', key: 'score', value: 50 }],
    },
    cave_entrance: {
      id: 'cave_entrance',
      title: 'Inside the Cave',
      content: 'The cave is dark but you can make out two passages. One leads left into darkness, the other right towards a faint glow.',
      choices: [
        {
          id: 'c4',
          text: 'Go left into darkness',
          targetNodeId: 'dark_passage',
        },
        {
          id: 'c5',
          text: 'Follow the glow to the right',
          targetNodeId: 'glowing_passage',
        },
      ],
    },
    dark_passage: {
      id: 'dark_passage',
      title: 'The Dark Passage',
      content: 'You stumble through the darkness. Suddenly, the ground gives way beneath you!',
      choices: [],
      isEnding: true,
      endingType: 'bad',
    },
    glowing_passage: {
      id: 'glowing_passage',
      title: 'The Treasure Chamber',
      content: 'The glow leads you to an incredible treasure chamber filled with gold and jewels. You have discovered the legendary lost treasure!',
      choices: [],
      isEnding: true,
      endingType: 'good',
      effects: [{ type: 'addScore', key: 'score', value: 500 }],
    },
  };
}

// ============================================================================
// Game Content Utilities
// ============================================================================

/**
 * Parse game prompt to determine game type and parameters
 */
export function parseGamePrompt(prompt: string): {
  type: GameType;
  topic: string;
  options: Record<string, unknown>;
} {
  const lowercasePrompt = prompt.toLowerCase();

  // Detect game type
  let type: GameType = 'trivia';
  if (lowercasePrompt.includes('trivia') || lowercasePrompt.includes('quiz game')) {
    type = 'trivia';
  } else if (lowercasePrompt.includes('memory') || lowercasePrompt.includes('matching')) {
    type = 'memory';
  } else if (lowercasePrompt.includes('tic-tac-toe') || lowercasePrompt.includes('tictactoe')) {
    type = 'tictactoe';
  } else if (
    lowercasePrompt.includes('adventure') ||
    lowercasePrompt.includes('story') ||
    lowercasePrompt.includes('choose your own')
  ) {
    type = 'adventure';
  } else if (lowercasePrompt.includes('personality') || lowercasePrompt.includes('what kind')) {
    type = 'quiz';
  } else if (lowercasePrompt.includes('mad lib') || lowercasePrompt.includes('fill in')) {
    type = 'madlibs';
  }

  // Extract topic (everything after "about" or the main subject)
  let topic = prompt;
  const aboutMatch = prompt.match(/about\s+(.+?)(?:\.|$)/i);
  if (aboutMatch) {
    topic = aboutMatch[1].trim();
  }

  // Extract options
  const options: Record<string, unknown> = {};

  // Question count
  const countMatch = prompt.match(/(\d+)\s*questions?/i);
  if (countMatch) {
    options.questionCount = parseInt(countMatch[1], 10);
  }

  // Difficulty
  if (lowercasePrompt.includes('easy')) {
    options.difficulty = 'easy';
  } else if (lowercasePrompt.includes('hard') || lowercasePrompt.includes('difficult')) {
    options.difficulty = 'hard';
  } else if (lowercasePrompt.includes('medium')) {
    options.difficulty = 'medium';
  }

  return { type, topic, options };
}
