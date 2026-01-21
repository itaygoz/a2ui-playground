/**
 * Trivia Game Template
 *
 * Multiple choice trivia game with score tracking.
 */

import type {
  GameTemplate,
  TriviaGameState,
  TriviaGameConfig,
  GameAction,
  TriviaQuestion,
} from '../types';
import type { A2UIDocument, A2UIComponent } from '@/lib/a2ui/types';

// ============================================================================
// Initial State
// ============================================================================

export function createInitialState(config: TriviaGameConfig): TriviaGameState {
  return {
    type: 'trivia',
    status: 'not_started',
    currentPhase: 'question',
    score: 0,
    maxScore: config.questionCount * 100,
    turn: 0,
    maxTurns: config.questionCount,
    history: [],
    currentQuestionIndex: 0,
    questions: [], // Will be populated by AI
    correctAnswers: 0,
    incorrectAnswers: 0,
    showingResult: false,
  };
}

// ============================================================================
// A2UI Generation
// ============================================================================

export function generateA2ui(state: TriviaGameState, config: TriviaGameConfig): A2UIDocument {
  const componentId = (suffix: string) => `trivia-${suffix}`;

  // If no questions yet, show loading/intro
  if (state.questions.length === 0) {
    return createIntroScreen(componentId, config);
  }

  // If game complete
  if (state.status === 'completed') {
    return createResultsScreen(componentId, state, config);
  }

  // Show current question
  const question = state.questions[state.currentQuestionIndex];
  if (!question) {
    return createResultsScreen(componentId, state, config);
  }

  // If showing result for current question
  if (state.showingResult) {
    return createAnswerResultScreen(componentId, state, question, config);
  }

  return createQuestionScreen(componentId, state, question, config);
}

function createIntroScreen(componentId: (s: string) => string, config: TriviaGameConfig): A2UIDocument {
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
        content: config.title || 'Trivia Game',
        variant: 'h1',
        align: 'center',
      },
      [componentId('description')]: {
        id: componentId('description'),
        type: 'Text',
        content: config.description || `Answer ${config.questionCount} questions and test your knowledge!`,
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
    meta: { gameType: 'trivia', phase: 'intro' },
  };
}

function createQuestionScreen(
  componentId: (s: string) => string,
  state: TriviaGameState,
  question: TriviaQuestion,
  _config: TriviaGameConfig
): A2UIDocument {
  const optionComponents: Record<string, A2UIComponent> = {};
  const optionIds: string[] = [];

  question.options.forEach((option, index) => {
    const optionId = componentId(`option-${index}`);
    optionIds.push(optionId);
    optionComponents[optionId] = {
      id: optionId,
      type: 'Button',
      label: option,
      variant: 'outline',
      fullWidth: true,
      onPress: {
        type: 'custom',
        handler: 'selectAnswer',
        params: { answer: option },
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
        children: [componentId('header'), componentId('question-card')],
        style: { padding: 24, gap: 16 },
      },
      [componentId('header')]: {
        id: componentId('header'),
        type: 'Row',
        children: [componentId('progress'), componentId('score')],
        mainAxisAlignment: 'space-between',
        style: { gap: 16 },
      },
      [componentId('progress')]: {
        id: componentId('progress'),
        type: 'Text',
        content: `Question ${state.currentQuestionIndex + 1} of ${state.questions.length}`,
        variant: 'caption',
      },
      [componentId('score')]: {
        id: componentId('score'),
        type: 'Badge',
        content: `Score: ${state.score}`,
        variant: 'secondary',
      },
      [componentId('question-card')]: {
        id: componentId('question-card'),
        type: 'Card',
        children: [componentId('question-text'), componentId('options')],
        style: { padding: 24 },
      },
      [componentId('question-text')]: {
        id: componentId('question-text'),
        type: 'Text',
        content: question.question,
        variant: 'h3',
        style: { margin: '0 0 24px 0' },
      },
      [componentId('options')]: {
        id: componentId('options'),
        type: 'Column',
        children: optionIds,
        style: { gap: 12 },
      },
      ...optionComponents,
    } as Record<string, A2UIComponent>,
    dataModel: {
      currentQuestion: state.currentQuestionIndex,
      score: state.score,
    },
    meta: { gameType: 'trivia', phase: 'question' },
  };
}

function createAnswerResultScreen(
  componentId: (s: string) => string,
  state: TriviaGameState,
  question: TriviaQuestion,
  _config: TriviaGameConfig
): A2UIDocument {
  const isCorrect = state.selectedAnswer === question.correctAnswer;
  const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('header'), componentId('result-card')],
        style: { padding: 24, gap: 16 },
      },
      [componentId('header')]: {
        id: componentId('header'),
        type: 'Row',
        children: [componentId('progress'), componentId('score')],
        style: { gap: 16 },
      },
      [componentId('progress')]: {
        id: componentId('progress'),
        type: 'Text',
        content: `Question ${state.currentQuestionIndex + 1} of ${state.questions.length}`,
        variant: 'caption',
      },
      [componentId('score')]: {
        id: componentId('score'),
        type: 'Badge',
        content: `Score: ${state.score}`,
        variant: 'secondary',
      },
      [componentId('result-card')]: {
        id: componentId('result-card'),
        type: 'Card',
        children: [
          componentId('result-icon'),
          componentId('result-text'),
          componentId('correct-answer'),
          ...(question.explanation ? [componentId('explanation')] : []),
          componentId('next-btn'),
        ],
        style: { padding: 24 },
      },
      [componentId('result-icon')]: {
        id: componentId('result-icon'),
        type: 'Icon',
        name: isCorrect ? 'check-circle' : 'x-circle',
        size: 'xl',
        color: isCorrect ? '#22c55e' : '#ef4444',
      },
      [componentId('result-text')]: {
        id: componentId('result-text'),
        type: 'Text',
        content: isCorrect ? 'Correct!' : 'Incorrect!',
        variant: 'h2',
        color: isCorrect ? 'success' : 'error',
      },
      [componentId('correct-answer')]: {
        id: componentId('correct-answer'),
        type: 'Text',
        content: `The correct answer is: ${question.correctAnswer}`,
        variant: 'body',
      },
      ...(question.explanation
        ? {
            [componentId('explanation')]: {
              id: componentId('explanation'),
              type: 'Text',
              content: question.explanation,
              variant: 'body',
              color: 'secondary',
              style: { margin: '16px 0' },
            },
          }
        : {}),
      [componentId('next-btn')]: {
        id: componentId('next-btn'),
        type: 'Button',
        label: isLastQuestion ? 'See Results' : 'Next Question',
        variant: 'primary',
        onPress: {
          type: 'custom',
          handler: isLastQuestion ? 'endGame' : 'nextQuestion',
        },
        style: { margin: '16px 0 0 0' },
      },
    } as Record<string, A2UIComponent>,
    dataModel: {},
    meta: { gameType: 'trivia', phase: 'result' },
  };
}

function createResultsScreen(
  componentId: (s: string) => string,
  state: TriviaGameState,
  _config: TriviaGameConfig
): A2UIDocument {
  const percentage = Math.round((state.correctAnswers / state.questions.length) * 100);
  let resultMessage = '';
  if (percentage >= 90) resultMessage = 'Outstanding! You\'re a trivia master!';
  else if (percentage >= 70) resultMessage = 'Great job! You know your stuff!';
  else if (percentage >= 50) resultMessage = 'Not bad! Keep learning!';
  else resultMessage = 'Keep practicing! You\'ll get better!';

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('title'), componentId('stats-card'), componentId('actions')],
        style: { padding: 24, gap: 24 },
      },
      [componentId('title')]: {
        id: componentId('title'),
        type: 'Text',
        content: 'Game Complete!',
        variant: 'h1',
        align: 'center',
      },
      [componentId('stats-card')]: {
        id: componentId('stats-card'),
        type: 'Card',
        children: [
          componentId('score-display'),
          componentId('stats-row'),
          componentId('message'),
        ],
        style: { padding: 24 },
      },
      [componentId('score-display')]: {
        id: componentId('score-display'),
        type: 'Text',
        content: `${state.score} points`,
        variant: 'h2',
        align: 'center',
      },
      [componentId('stats-row')]: {
        id: componentId('stats-row'),
        type: 'Row',
        children: [componentId('correct-stat'), componentId('incorrect-stat')],
        mainAxisAlignment: 'center',
        style: { gap: 24, margin: '16px 0' },
      },
      [componentId('correct-stat')]: {
        id: componentId('correct-stat'),
        type: 'Column',
        children: [componentId('correct-num'), componentId('correct-label')],
      },
      [componentId('correct-num')]: {
        id: componentId('correct-num'),
        type: 'Text',
        content: String(state.correctAnswers),
        variant: 'h3',
        color: 'success',
        align: 'center',
      },
      [componentId('correct-label')]: {
        id: componentId('correct-label'),
        type: 'Text',
        content: 'Correct',
        variant: 'caption',
        align: 'center',
      },
      [componentId('incorrect-stat')]: {
        id: componentId('incorrect-stat'),
        type: 'Column',
        children: [componentId('incorrect-num'), componentId('incorrect-label')],
      },
      [componentId('incorrect-num')]: {
        id: componentId('incorrect-num'),
        type: 'Text',
        content: String(state.incorrectAnswers),
        variant: 'h3',
        color: 'error',
        align: 'center',
      },
      [componentId('incorrect-label')]: {
        id: componentId('incorrect-label'),
        type: 'Text',
        content: 'Incorrect',
        variant: 'caption',
        align: 'center',
      },
      [componentId('message')]: {
        id: componentId('message'),
        type: 'Text',
        content: resultMessage,
        variant: 'body',
        align: 'center',
        style: { margin: '16px 0 0 0' },
      },
      [componentId('actions')]: {
        id: componentId('actions'),
        type: 'Row',
        children: [componentId('play-again-btn')],
        mainAxisAlignment: 'center',
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
    meta: { gameType: 'trivia', phase: 'complete' },
  };
}

// ============================================================================
// Action Processing
// ============================================================================

export function processAction(
  state: TriviaGameState,
  action: GameAction,
  config: TriviaGameConfig
): TriviaGameState {
  switch (action.type) {
    case 'SELECT_ANSWER': {
      const answer = action.payload?.answer as string;
      const question = state.questions[state.currentQuestionIndex];
      const isCorrect = answer === question?.correctAnswer;

      return {
        ...state,
        selectedAnswer: answer,
        showingResult: true,
        score: isCorrect ? state.score + 100 : state.score,
        correctAnswers: isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
        incorrectAnswers: isCorrect ? state.incorrectAnswers : state.incorrectAnswers + 1,
        turn: state.turn + 1,
      };
    }

    case 'NEXT_QUESTION': {
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedAnswer: undefined,
        showingResult: false,
        currentPhase: 'question',
      };
    }

    case 'SET_QUESTIONS': {
      const questions = action.payload?.questions as TriviaQuestion[];
      return {
        ...state,
        questions,
        maxScore: questions.length * 100,
        maxTurns: questions.length,
      };
    }

    case 'START_GAME': {
      return {
        ...state,
        status: 'in_progress',
        currentPhase: 'question',
        startedAt: new Date(),
      };
    }

    case 'END_GAME': {
      return {
        ...state,
        status: 'completed',
        completedAt: new Date(),
      };
    }

    case 'RESTART_GAME': {
      return createInitialState(config);
    }

    default:
      return state;
  }
}

// ============================================================================
// Completion Check
// ============================================================================

export function isGameComplete(state: TriviaGameState): boolean {
  return (
    state.status === 'completed' ||
    (state.questions.length > 0 &&
      state.currentQuestionIndex >= state.questions.length &&
      !state.showingResult)
  );
}

// ============================================================================
// Template Export
// ============================================================================

export const triviaTemplate: GameTemplate = {
  type: 'trivia',
  name: 'Trivia Game',
  description: 'Multiple choice trivia game with score tracking',
  defaultConfig: {
    type: 'trivia',
    title: 'Trivia Challenge',
    questionCount: 10,
    showExplanations: true,
  },
  initialA2ui: createIntroScreen((s) => `trivia-${s}`, {
    type: 'trivia',
    title: 'Trivia Challenge',
    questionCount: 10,
    showExplanations: true,
  }),
  createInitialState: createInitialState as (config: unknown) => TriviaGameState,
  generateA2ui: generateA2ui as (state: unknown, config: unknown) => A2UIDocument,
  processAction: processAction as (state: unknown, action: GameAction, config: unknown) => TriviaGameState,
  isGameComplete: isGameComplete as (state: unknown) => boolean,
};
