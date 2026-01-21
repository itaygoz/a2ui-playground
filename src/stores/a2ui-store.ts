import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { A2UIDocument, DataModel, Action, ComponentId, A2UIComponent } from '@/lib/a2ui/types';
import {
  addComponentToDocument,
  moveComponent as moveComponentInDoc,
  deleteComponent as deleteComponentFromDoc,
  type DropTarget,
} from '@/lib/dnd/a2ui-dnd-handlers';

// Default empty A2UI document
const DEFAULT_DOCUMENT: A2UIDocument = {
  version: '1.0',
  root: 'root',
  components: {
    root: {
      id: 'root',
      type: 'Column',
      children: [],
      style: {
        padding: 16,
        gap: 16,
      },
    },
  },
  dataModel: {},
  meta: {
    title: 'Untitled',
    description: '',
    created: new Date().toISOString(),
  },
};

// Example document for testing
const EXAMPLE_DOCUMENT: A2UIDocument = {
  version: '1.0',
  root: 'root',
  components: {
    root: {
      id: 'root',
      type: 'Column',
      children: ['card1'],
      style: {
        padding: 24,
        gap: 16,
        maxWidth: 400,
      },
    },
    card1: {
      id: 'card1',
      type: 'Card',
      title: 'Welcome to A2UI',
      subtitle: 'Build UIs with AI',
      children: ['content-col'],
    },
    'content-col': {
      id: 'content-col',
      type: 'Column',
      children: ['text1', 'name-field', 'greeting', 'button-row'],
      style: {
        gap: 12,
      },
    },
    text1: {
      id: 'text1',
      type: 'Text',
      text: 'Enter your name below:',
    },
    'name-field': {
      id: 'name-field',
      type: 'TextField',
      value: '/name',
      label: 'Your Name',
      placeholder: 'Type your name...',
    },
    greeting: {
      id: 'greeting',
      type: 'Text',
      text: '/greeting',
      textStyle: {
        size: 'lg',
        weight: 'semibold',
        color: '#3b82f6',
      },
    },
    'button-row': {
      id: 'button-row',
      type: 'Row',
      children: ['greet-btn', 'clear-btn'],
      style: {
        gap: 8,
      },
    },
    'greet-btn': {
      id: 'greet-btn',
      type: 'Button',
      label: 'Greet Me',
      variant: 'default',
      onPress: {
        type: 'update',
        target: '/greeting',
        value: 'Hello there!',
      },
    },
    'clear-btn': {
      id: 'clear-btn',
      type: 'Button',
      label: 'Clear',
      variant: 'outline',
      onPress: {
        type: 'update',
        target: '/name',
        value: '',
      },
    },
  },
  dataModel: {
    name: '',
    greeting: '',
  },
  meta: {
    title: 'Greeting Example',
    description: 'A simple A2UI demo with data binding',
    created: new Date().toISOString(),
  },
};

export type PlaygroundMode = 'playground' | 'game';
export type ViewMode = 'split' | 'preview' | 'editor';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  a2uiDocument?: A2UIDocument;
}

interface A2UIStore {
  // Document state
  document: A2UIDocument;
  setDocument: (document: A2UIDocument) => void;
  updateDocument: (updates: Partial<A2UIDocument>) => void;
  resetDocument: () => void;
  loadExample: () => void;

  // Data model
  dataModel: DataModel;
  setDataModel: (dataModel: DataModel) => void;
  updateDataModel: (path: string, value: unknown) => void;

  // Editor state
  jsonString: string;
  setJsonString: (json: string) => void;
  jsonError: string | null;
  setJsonError: (error: string | null) => void;
  syncFromJson: () => boolean;
  syncToJson: () => void;

  // Selection state
  selectedComponentId: ComponentId | null;
  setSelectedComponentId: (id: ComponentId | null) => void;

  // View state
  playgroundMode: PlaygroundMode;
  setPlaygroundMode: (mode: PlaygroundMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Chat state
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  // Actions
  handleAction: (action: Action) => void;

  // DnD actions
  addComponent: (component: A2UIComponent, target: DropTarget) => void;
  moveComponent: (componentId: ComponentId, target: DropTarget) => void;
  deleteComponent: (componentId: ComponentId) => void;

  // Undo/Redo
  history: A2UIDocument[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useA2UIStore = create<A2UIStore>()(
  persist(
    (set, get) => ({
      // Document state
      document: DEFAULT_DOCUMENT,
      setDocument: (document) => {
        const jsonString = JSON.stringify(document, null, 2);
        set({
          document,
          dataModel: document.dataModel || {},
          jsonString,
          jsonError: null,
        });
        get().pushHistory();
      },
      updateDocument: (updates) => {
        const currentDoc = get().document;
        const newDoc = { ...currentDoc, ...updates };
        const jsonString = JSON.stringify(newDoc, null, 2);
        set({
          document: newDoc,
          jsonString,
        });
        get().pushHistory();
      },
      resetDocument: () => {
        const jsonString = JSON.stringify(DEFAULT_DOCUMENT, null, 2);
        set({
          document: DEFAULT_DOCUMENT,
          dataModel: {},
          jsonString,
          jsonError: null,
          selectedComponentId: null,
        });
      },
      loadExample: () => {
        const jsonString = JSON.stringify(EXAMPLE_DOCUMENT, null, 2);
        set({
          document: EXAMPLE_DOCUMENT,
          dataModel: EXAMPLE_DOCUMENT.dataModel || {},
          jsonString,
          jsonError: null,
          selectedComponentId: null,
        });
      },

      // Data model
      dataModel: {},
      setDataModel: (dataModel) => {
        const doc = get().document;
        const newDoc = { ...doc, dataModel };
        const jsonString = JSON.stringify(newDoc, null, 2);
        set({
          dataModel,
          document: newDoc,
          jsonString,
        });
      },
      updateDataModel: (path, value) => {
        const { dataModel, document } = get();
        // Simple path update (for now, just top-level keys)
        const key = path.startsWith('/') ? path.slice(1) : path;
        const newDataModel = { ...dataModel, [key]: value };
        const newDoc = { ...document, dataModel: newDataModel };
        set({
          dataModel: newDataModel,
          document: newDoc,
        });
      },

      // Editor state
      jsonString: JSON.stringify(DEFAULT_DOCUMENT, null, 2),
      setJsonString: (json) => set({ jsonString: json }),
      jsonError: null,
      setJsonError: (error) => set({ jsonError: error }),
      syncFromJson: () => {
        const { jsonString } = get();
        try {
          const parsed = JSON.parse(jsonString) as A2UIDocument;
          // Basic validation
          if (!parsed.root || !parsed.components) {
            set({ jsonError: 'Invalid A2UI document: missing root or components' });
            return false;
          }
          set({
            document: parsed,
            dataModel: parsed.dataModel || {},
            jsonError: null,
          });
          get().pushHistory();
          return true;
        } catch (e) {
          set({ jsonError: (e as Error).message });
          return false;
        }
      },
      syncToJson: () => {
        const { document } = get();
        const jsonString = JSON.stringify(document, null, 2);
        set({ jsonString, jsonError: null });
      },

      // Selection state
      selectedComponentId: null,
      setSelectedComponentId: (id) => set({ selectedComponentId: id }),

      // View state
      playgroundMode: 'playground',
      setPlaygroundMode: (mode) => set({ playgroundMode: mode }),
      viewMode: 'split',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Chat state
      messages: [],
      addMessage: (message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      clearMessages: () => set({ messages: [] }),
      isGenerating: false,
      setIsGenerating: (generating) => set({ isGenerating: generating }),

      // Actions
      handleAction: (action) => {
        const { dataModel, document } = get();
        switch (action.type) {
          case 'update':
            if (action.target) {
              const key = action.target.startsWith('/') ? action.target.slice(1) : action.target;
              const newDataModel = { ...dataModel, [key]: action.value };
              const newDoc = { ...document, dataModel: newDataModel };
              const jsonString = JSON.stringify(newDoc, null, 2);
              set({
                dataModel: newDataModel,
                document: newDoc,
                jsonString,
              });
            }
            break;
          case 'submit':
            console.log('Form submitted:', action.payload);
            break;
          case 'navigate':
            if (action.url) {
              window.open(action.url, '_blank');
            }
            break;
          case 'custom':
            console.log('Custom action:', action.customAction, action.payload);
            break;
        }
      },

      // DnD actions
      addComponent: (component, target) => {
        const { document } = get();
        const newDoc = addComponentToDocument(document, component, target);
        const jsonString = JSON.stringify(newDoc, null, 2);
        set({
          document: newDoc,
          jsonString,
          jsonError: null,
        });
        get().pushHistory();
      },
      moveComponent: (componentId, target) => {
        const { document } = get();
        const newDoc = moveComponentInDoc(document, componentId, target);
        const jsonString = JSON.stringify(newDoc, null, 2);
        set({
          document: newDoc,
          jsonString,
          jsonError: null,
        });
        get().pushHistory();
      },
      deleteComponent: (componentId) => {
        const { document, selectedComponentId } = get();
        const newDoc = deleteComponentFromDoc(document, componentId);
        const jsonString = JSON.stringify(newDoc, null, 2);
        set({
          document: newDoc,
          jsonString,
          jsonError: null,
          // Clear selection if deleted component was selected
          selectedComponentId: selectedComponentId === componentId ? null : selectedComponentId,
        });
        get().pushHistory();
      },

      // Undo/Redo
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const doc = history[newIndex];
          const jsonString = JSON.stringify(doc, null, 2);
          set({
            document: doc,
            dataModel: doc.dataModel || {},
            jsonString,
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true,
          });
        }
      },
      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const doc = history[newIndex];
          const jsonString = JSON.stringify(doc, null, 2);
          set({
            document: doc,
            dataModel: doc.dataModel || {},
            jsonString,
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < history.length - 1,
          });
        }
      },
      pushHistory: () => {
        const { document, history, historyIndex } = get();
        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(structuredClone(document));
        // Limit history size
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: newHistory.length > 1,
          canRedo: false,
        });
      },
    }),
    {
      name: 'a2ui-playground-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        document: state.document,
        dataModel: state.dataModel,
        jsonString: state.jsonString,
        messages: state.messages.slice(-50), // Keep last 50 messages
        playgroundMode: state.playgroundMode,
      }),
    }
  )
);
