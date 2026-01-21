/**
 * Adventure Game Template
 *
 * Choose-your-own-adventure story game.
 */

import type {
  GameTemplate,
  AdventureGameState,
  AdventureGameConfig,
  GameAction,
  StoryNode,
  StoryChoice,
  StoryEffect,
} from '../types';
import type { A2UIDocument, A2UIComponent } from '@/lib/a2ui/types';

// ============================================================================
// Initial State
// ============================================================================

export function createInitialState(config: AdventureGameConfig): AdventureGameState {
  return {
    type: 'adventure',
    status: 'not_started',
    currentPhase: 'story',
    score: 0,
    maxScore: 1000,
    turn: 0,
    history: [],
    currentNodeId: config.startNodeId,
    nodes: {}, // Will be populated by AI
    visitedNodes: [],
    inventory: [],
    flags: {},
    endings: [],
  };
}

// ============================================================================
// A2UI Generation
// ============================================================================

export function generateA2ui(state: AdventureGameState, config: AdventureGameConfig): A2UIDocument {
  const componentId = (suffix: string) => `adventure-${suffix}`;

  if (state.status === 'not_started' || Object.keys(state.nodes).length === 0) {
    return createIntroScreen(componentId, config);
  }

  const currentNode = state.nodes[state.currentNodeId];
  if (!currentNode) {
    return createIntroScreen(componentId, config);
  }

  if (currentNode.isEnding || state.status === 'completed') {
    return createEndingScreen(componentId, state, currentNode, config);
  }

  return createStoryScreen(componentId, state, currentNode, config);
}

function createIntroScreen(
  componentId: (s: string) => string,
  config: AdventureGameConfig
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
        content: config.title || 'Adventure Game',
        variant: 'h1',
        align: 'center',
      },
      [componentId('description')]: {
        id: componentId('description'),
        type: 'Text',
        content: config.description || 'Your choices shape the story. Choose wisely!',
        variant: 'body',
        align: 'center',
        color: 'secondary',
      },
      [componentId('start-btn')]: {
        id: componentId('start-btn'),
        type: 'Button',
        label: 'Begin Adventure',
        variant: 'primary',
        onPress: {
          type: 'custom',
          handler: 'startGame',
        },
      },
    } as Record<string, A2UIComponent>,
    dataModel: {},
    meta: { gameType: 'adventure', phase: 'intro' },
  };
}

function createStoryScreen(
  componentId: (s: string) => string,
  state: AdventureGameState,
  node: StoryNode,
  _config: AdventureGameConfig
): A2UIDocument {
  const choiceComponents: Record<string, A2UIComponent> = {};
  const choiceIds: string[] = [];

  // Filter choices based on conditions
  const availableChoices = node.choices.filter((choice) => {
    if (!choice.condition) return true;
    return evaluateCondition(choice.condition, state);
  });

  availableChoices.forEach((choice, index) => {
    const choiceId = componentId(`choice-${index}`);
    choiceIds.push(choiceId);

    choiceComponents[choiceId] = {
      id: choiceId,
      type: 'Button',
      label: choice.text,
      variant: 'outline',
      fullWidth: true,
      onPress: {
        type: 'custom',
        handler: 'makeChoice',
        params: { choiceId: choice.id, targetNodeId: choice.targetNodeId },
      },
    };
  });

  const hasInventory = state.inventory.length > 0;

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [
          componentId('header'),
          componentId('story-card'),
          ...(hasInventory ? [componentId('inventory-card')] : []),
        ],
        style: { padding: 24, gap: 16 },
      },
      [componentId('header')]: {
        id: componentId('header'),
        type: 'Row',
        children: [componentId('turns'), componentId('score')],
        mainAxisAlignment: 'space-between',
        style: { gap: 16 },
      },
      [componentId('turns')]: {
        id: componentId('turns'),
        type: 'Badge',
        content: `Turn ${state.turn + 1}`,
        variant: 'outline',
      },
      [componentId('score')]: {
        id: componentId('score'),
        type: 'Badge',
        content: `Score: ${state.score}`,
        variant: 'secondary',
      },
      [componentId('story-card')]: {
        id: componentId('story-card'),
        type: 'Card',
        children: [
          ...(node.title ? [componentId('node-title')] : []),
          componentId('story-text'),
          componentId('choices'),
        ],
        style: { padding: 24 },
      },
      ...(node.title
        ? {
            [componentId('node-title')]: {
              id: componentId('node-title'),
              type: 'Text',
              content: node.title,
              variant: 'h3',
              style: { margin: '0 0 16px 0' },
            },
          }
        : {}),
      [componentId('story-text')]: {
        id: componentId('story-text'),
        type: 'Text',
        content: node.content,
        variant: 'body',
        style: { margin: '0 0 24px 0', lineHeight: 1.6 },
      },
      [componentId('choices')]: {
        id: componentId('choices'),
        type: 'Column',
        children: choiceIds,
        style: { gap: 12 },
      },
      ...choiceComponents,
      ...(hasInventory
        ? {
            [componentId('inventory-card')]: {
              id: componentId('inventory-card'),
              type: 'Card',
              children: [componentId('inventory-title'), componentId('inventory-list')],
              variant: 'outlined',
              style: { padding: 16 },
            },
            [componentId('inventory-title')]: {
              id: componentId('inventory-title'),
              type: 'Text',
              content: 'Inventory',
              variant: 'caption',
            },
            [componentId('inventory-list')]: {
              id: componentId('inventory-list'),
              type: 'Row',
              children: state.inventory.map((_, i) => componentId(`inv-item-${i}`)),
              wrap: true,
              style: { gap: 8 },
            },
            ...state.inventory.reduce((acc, item, i) => {
              acc[componentId(`inv-item-${i}`)] = {
                id: componentId(`inv-item-${i}`),
                type: 'Badge',
                content: item,
                variant: 'secondary',
              };
              return acc;
            }, {} as Record<string, A2UIComponent>),
          }
        : {}),
    } as Record<string, A2UIComponent>,
    dataModel: {
      currentNode: state.currentNodeId,
      inventory: state.inventory,
      score: state.score,
    },
    meta: { gameType: 'adventure', phase: 'story' },
  };
}

function createEndingScreen(
  componentId: (s: string) => string,
  state: AdventureGameState,
  node: StoryNode,
  _config: AdventureGameConfig
): A2UIDocument {
  const endingType = node.endingType || 'neutral';
  let iconName = 'flag';
  let iconColor = '#6b7280';

  if (endingType === 'good') {
    iconName = 'trophy';
    iconColor = '#eab308';
  } else if (endingType === 'bad') {
    iconName = 'skull';
    iconColor = '#ef4444';
  }

  return {
    version: '1.0',
    root: componentId('root'),
    components: {
      [componentId('root')]: {
        id: componentId('root'),
        type: 'Column',
        children: [componentId('ending-card'), componentId('stats-card'), componentId('actions')],
        crossAxisAlignment: 'center',
        style: { padding: 24, gap: 24 },
      },
      [componentId('ending-card')]: {
        id: componentId('ending-card'),
        type: 'Card',
        children: [componentId('icon'), componentId('title'), componentId('ending-text')],
        style: { padding: 24, maxWidth: 500 },
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
        content: node.title || 'The End',
        variant: 'h2',
        align: 'center',
      },
      [componentId('ending-text')]: {
        id: componentId('ending-text'),
        type: 'Text',
        content: node.content,
        variant: 'body',
        align: 'center',
        style: { margin: '16px 0 0 0', lineHeight: 1.6 },
      },
      [componentId('stats-card')]: {
        id: componentId('stats-card'),
        type: 'Card',
        children: [componentId('stats-title'), componentId('stats-row')],
        variant: 'outlined',
        style: { padding: 16, width: 300 },
      },
      [componentId('stats-title')]: {
        id: componentId('stats-title'),
        type: 'Text',
        content: 'Adventure Stats',
        variant: 'caption',
        align: 'center',
      },
      [componentId('stats-row')]: {
        id: componentId('stats-row'),
        type: 'Row',
        children: [componentId('turns-stat'), componentId('score-stat'), componentId('places-stat')],
        mainAxisAlignment: 'center',
        style: { gap: 24, margin: '12px 0' },
      },
      [componentId('turns-stat')]: {
        id: componentId('turns-stat'),
        type: 'Column',
        children: [componentId('turns-num'), componentId('turns-label')],
      },
      [componentId('turns-num')]: {
        id: componentId('turns-num'),
        type: 'Text',
        content: String(state.turn),
        variant: 'h4',
        align: 'center',
      },
      [componentId('turns-label')]: {
        id: componentId('turns-label'),
        type: 'Text',
        content: 'Turns',
        variant: 'caption',
        align: 'center',
      },
      [componentId('score-stat')]: {
        id: componentId('score-stat'),
        type: 'Column',
        children: [componentId('score-num'), componentId('score-label')],
      },
      [componentId('score-num')]: {
        id: componentId('score-num'),
        type: 'Text',
        content: String(state.score),
        variant: 'h4',
        align: 'center',
      },
      [componentId('score-label')]: {
        id: componentId('score-label'),
        type: 'Text',
        content: 'Score',
        variant: 'caption',
        align: 'center',
      },
      [componentId('places-stat')]: {
        id: componentId('places-stat'),
        type: 'Column',
        children: [componentId('places-num'), componentId('places-label')],
      },
      [componentId('places-num')]: {
        id: componentId('places-num'),
        type: 'Text',
        content: String(state.visitedNodes.length),
        variant: 'h4',
        align: 'center',
      },
      [componentId('places-label')]: {
        id: componentId('places-label'),
        type: 'Text',
        content: 'Places',
        variant: 'caption',
        align: 'center',
      },
      [componentId('actions')]: {
        id: componentId('actions'),
        type: 'Row',
        children: [componentId('restart-btn')],
        style: { gap: 16 },
      },
      [componentId('restart-btn')]: {
        id: componentId('restart-btn'),
        type: 'Button',
        label: 'Start New Adventure',
        variant: 'primary',
        onPress: {
          type: 'custom',
          handler: 'restartGame',
        },
      },
    } as Record<string, A2UIComponent>,
    dataModel: {},
    meta: { gameType: 'adventure', phase: 'ending' },
  };
}

// ============================================================================
// Condition Evaluation
// ============================================================================

function evaluateCondition(
  condition: NonNullable<StoryChoice['condition']>,
  state: AdventureGameState
): boolean {
  let result = false;

  switch (condition.type) {
    case 'hasItem':
      result = state.inventory.includes(condition.value);
      break;
    case 'hasFlag':
      result = !!state.flags[condition.value];
      break;
    case 'visitedNode':
      result = state.visitedNodes.includes(condition.value);
      break;
    default:
      result = true;
  }

  return condition.negate ? !result : result;
}

// ============================================================================
// Effect Application
// ============================================================================

function applyEffects(effects: StoryEffect[], state: AdventureGameState): AdventureGameState {
  let newState = { ...state };

  for (const effect of effects) {
    switch (effect.type) {
      case 'addItem':
        if (!newState.inventory.includes(effect.key)) {
          newState = {
            ...newState,
            inventory: [...newState.inventory, effect.key],
          };
        }
        break;
      case 'removeItem':
        newState = {
          ...newState,
          inventory: newState.inventory.filter((item) => item !== effect.key),
        };
        break;
      case 'setFlag':
        newState = {
          ...newState,
          flags: {
            ...newState.flags,
            [effect.key]: effect.value !== false,
          },
        };
        break;
      case 'addScore':
        const scoreChange = typeof effect.value === 'number' ? effect.value : 0;
        newState = {
          ...newState,
          score: newState.score + scoreChange,
        };
        break;
    }
  }

  return newState;
}

// ============================================================================
// Action Processing
// ============================================================================

export function processAction(
  state: AdventureGameState,
  action: GameAction,
  config: AdventureGameConfig
): AdventureGameState {
  switch (action.type) {
    case 'MAKE_CHOICE': {
      const targetNodeId = action.payload?.targetNodeId as string;
      const choiceId = action.payload?.choiceId as string;

      // Find the choice that was made
      const currentNode = state.nodes[state.currentNodeId];
      const choice = currentNode?.choices.find((c) => c.id === choiceId);

      // Apply choice effects
      let newState = state;
      if (choice?.effects) {
        newState = applyEffects(choice.effects, state);
      }

      // Move to new node
      const targetNode = state.nodes[targetNodeId];
      if (targetNode?.effects) {
        newState = applyEffects(targetNode.effects, newState);
      }

      const visitedNodes = state.visitedNodes.includes(targetNodeId)
        ? state.visitedNodes
        : [...state.visitedNodes, targetNodeId];

      const isEnding = targetNode?.isEnding ?? false;

      return {
        ...newState,
        currentNodeId: targetNodeId,
        visitedNodes,
        turn: state.turn + 1,
        status: isEnding ? 'completed' : state.status,
        completedAt: isEnding ? new Date() : undefined,
      };
    }

    case 'SET_NODES': {
      const nodes = action.payload?.nodes as Record<string, StoryNode>;
      return {
        ...state,
        nodes,
        visitedNodes: [config.startNodeId],
      };
    }

    case 'START_GAME': {
      return {
        ...state,
        status: 'in_progress',
        startedAt: new Date(),
        visitedNodes: [state.currentNodeId],
      };
    }

    case 'RESTART_GAME': {
      return {
        ...createInitialState(config),
        nodes: state.nodes, // Keep the story nodes
        status: 'in_progress',
        startedAt: new Date(),
        visitedNodes: [config.startNodeId],
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// Completion Check
// ============================================================================

export function isGameComplete(state: AdventureGameState): boolean {
  const currentNode = state.nodes[state.currentNodeId];
  return currentNode?.isEnding ?? false;
}

// ============================================================================
// Template Export
// ============================================================================

export const adventureTemplate: GameTemplate = {
  type: 'adventure',
  name: 'Adventure Game',
  description: 'Choose-your-own-adventure interactive story',
  defaultConfig: {
    type: 'adventure',
    title: 'Adventure Game',
    startNodeId: 'start',
  },
  initialA2ui: createIntroScreen((s) => `adventure-${s}`, {
    type: 'adventure',
    title: 'Adventure Game',
    startNodeId: 'start',
  }),
  createInitialState: createInitialState as (config: unknown) => AdventureGameState,
  generateA2ui: generateA2ui as (state: unknown, config: unknown) => A2UIDocument,
  processAction: processAction as (state: unknown, action: GameAction, config: unknown) => AdventureGameState,
  isGameComplete: isGameComplete as (state: unknown) => boolean,
};
