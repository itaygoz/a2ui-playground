'use client';

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import type { DataModel, JsonPointer, Action } from '@/lib/a2ui/types';
import {
  getValueByPointer,
  setValueByPointer,
  resolveValue,
  isJsonPointer,
} from '@/lib/a2ui/json-pointer';

interface DataModelContextValue {
  dataModel: DataModel;
  getValue: <T>(pointer: JsonPointer) => T | undefined;
  setValue: (pointer: JsonPointer, value: unknown) => void;
  resolveValue: <T>(value: T | JsonPointer) => T;
  executeAction: (action: Action) => void;
}

const DataModelContext = createContext<DataModelContextValue | null>(null);

interface DataModelProviderProps {
  dataModel: DataModel;
  onDataModelChange: (dataModel: DataModel) => void;
  onAction?: (action: Action) => void;
  children: React.ReactNode;
}

export function DataModelProvider({
  dataModel,
  onDataModelChange,
  onAction,
  children,
}: DataModelProviderProps) {
  const getValue = useCallback(
    <T,>(pointer: JsonPointer): T | undefined => {
      return getValueByPointer<T>(dataModel, pointer);
    },
    [dataModel]
  );

  const setValue = useCallback(
    (pointer: JsonPointer, value: unknown) => {
      const newDataModel = setValueByPointer(dataModel, pointer, value);
      onDataModelChange(newDataModel);
    },
    [dataModel, onDataModelChange]
  );

  const resolve = useCallback(
    <T,>(value: T | JsonPointer): T => {
      return resolveValue(value, dataModel);
    },
    [dataModel]
  );

  const executeAction = useCallback(
    (action: Action) => {
      switch (action.type) {
        case 'update':
          if (action.target) {
            let valueToSet = action.value;
            // If value is a JSON pointer, resolve it first
            if (isJsonPointer(action.value)) {
              valueToSet = getValueByPointer(dataModel, action.value as JsonPointer);
            }
            setValue(action.target, valueToSet);
          }
          break;

        case 'submit':
          // Call onAction handler for form submission
          onAction?.(action);
          break;

        case 'navigate':
          if (action.url) {
            // Handle navigation (could be internal or external)
            if (action.url.startsWith('http://') || action.url.startsWith('https://')) {
              window.open(action.url, '_blank');
            } else {
              // For internal navigation, let the app handle it
              onAction?.(action);
            }
          }
          break;

        case 'custom':
          // Pass custom actions to the handler
          onAction?.(action);
          break;

        default:
          console.warn('Unknown action type:', action);
      }
    },
    [dataModel, setValue, onAction]
  );

  const contextValue = useMemo(
    () => ({
      dataModel,
      getValue,
      setValue,
      resolveValue: resolve,
      executeAction,
    }),
    [dataModel, getValue, setValue, resolve, executeAction]
  );

  return (
    <DataModelContext.Provider value={contextValue}>
      {children}
    </DataModelContext.Provider>
  );
}

export function useDataModel() {
  const context = useContext(DataModelContext);
  if (!context) {
    throw new Error('useDataModel must be used within a DataModelProvider');
  }
  return context;
}

export function useResolvedValue<T>(value: T | JsonPointer): T {
  const { resolveValue } = useDataModel();
  return resolveValue(value);
}

export function useBoundValue<T>(pointer: JsonPointer): [T | undefined, (value: T) => void] {
  const { getValue, setValue } = useDataModel();
  const value = getValue<T>(pointer);
  const updateValue = useCallback(
    (newValue: T) => setValue(pointer, newValue),
    [setValue, pointer]
  );
  return [value, updateValue];
}
