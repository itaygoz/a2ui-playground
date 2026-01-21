'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useA2UIStore } from '@/stores/a2ui-store';

// A2UI JSON Schema for validation
const A2UI_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['root', 'components'],
  properties: {
    version: { type: 'string' },
    root: { type: 'string' },
    components: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['id', 'type'],
        properties: {
          id: { type: 'string' },
          type: {
            type: 'string',
            enum: [
              'Text', 'Image', 'Icon', 'Divider', 'Spacer', 'Badge', 'Avatar', 'Progress',
              'Row', 'Column', 'Card', 'Container', 'Grid', 'Stack', 'ScrollView', 'Expandable',
              'Button', 'TextField', 'TextArea', 'Checkbox', 'RadioGroup', 'Select', 'Slider', 'Switch', 'DatePicker',
              'List', 'ListItem', 'Tabs', 'Link', 'Alert', 'Tooltip', 'Loading',
            ],
          },
          visible: {},
          enabled: {},
          style: {
            type: 'object',
            properties: {
              padding: {},
              margin: {},
              width: {},
              height: {},
              backgroundColor: { type: 'string' },
              borderRadius: {},
              gap: {},
              flex: { type: 'number' },
            },
          },
          children: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    dataModel: { type: 'object' },
    meta: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        author: { type: 'string' },
        created: { type: 'string' },
        modified: { type: 'string' },
      },
    },
  },
};

interface JsonEditorProps {
  className?: string;
}

export function JsonEditor({ className }: JsonEditorProps) {
  const {
    jsonString,
    setJsonString,
    jsonError,
    syncFromJson,
  } = useA2UIStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure JSON language features
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'https://a2ui.org/schema.json',
          fileMatch: ['*'],
          schema: A2UI_SCHEMA,
        },
      ],
      enableSchemaRequest: false,
      allowComments: false,
      trailingCommas: 'error',
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      syncFromJson();
    });

    // Format on paste
    editor.onDidPaste(() => {
      setTimeout(() => {
        editor.getAction('editor.action.formatDocument')?.run();
      }, 100);
    });
  }, [syncFromJson]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    setJsonString(value);

    // Debounce sync to avoid too many updates
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      syncFromJson();
    }, 500);
  }, [setJsonString, syncFromJson]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      <Editor
        height="100%"
        defaultLanguage="json"
        value={jsonString}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
          foldingStrategy: 'indentation',
          showFoldingControls: 'always',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            strings: true,
            other: true,
            comments: false,
          },
        }}
      />
      {jsonError && (
        <div className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground px-4 py-2 text-sm font-mono">
          {jsonError}
        </div>
      )}
    </div>
  );
}
