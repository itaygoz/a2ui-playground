/**
 * JSON Pointer implementation (RFC 6901)
 * https://datatracker.ietf.org/doc/html/rfc6901
 *
 * JSON Pointers are strings that identify a specific value
 * within a JSON document. They are used in A2UI for data binding.
 */

import type { DataModel, JsonPointer } from './types';

/**
 * Checks if a string is a valid JSON Pointer
 */
export function isJsonPointer(value: unknown): value is JsonPointer {
  if (typeof value !== 'string') return false;
  // JSON Pointers start with '/' or are empty string (root)
  return value === '' || value.startsWith('/');
}

/**
 * Parses a JSON Pointer string into an array of reference tokens
 */
export function parsePointer(pointer: JsonPointer): string[] {
  if (pointer === '') return [];
  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON Pointer: ${pointer}. Must start with '/' or be empty.`);
  }

  return pointer
    .slice(1) // Remove leading '/'
    .split('/')
    .map(unescape);
}

/**
 * Escapes a reference token according to RFC 6901
 * '~' -> '~0'
 * '/' -> '~1'
 */
export function escape(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * Unescapes a reference token according to RFC 6901
 * '~1' -> '/'
 * '~0' -> '~'
 */
export function unescape(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * Compiles reference tokens back into a JSON Pointer string
 */
export function compilePointer(tokens: string[]): JsonPointer {
  if (tokens.length === 0) return '';
  return '/' + tokens.map(escape).join('/');
}

/**
 * Gets a value from an object using a JSON Pointer
 *
 * @param obj - The object to traverse
 * @param pointer - The JSON Pointer string
 * @returns The value at the pointer location, or undefined if not found
 */
export function getValueByPointer<T = unknown>(
  obj: DataModel | Record<string, unknown>,
  pointer: JsonPointer
): T | undefined {
  if (pointer === '') return obj as T;

  const tokens = parsePointer(pointer);
  let current: unknown = obj;

  for (const token of tokens) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    if (Array.isArray(current)) {
      // For arrays, token should be a numeric index or '-' (end of array)
      if (token === '-') {
        return undefined; // '-' is for appending, not reading
      }
      const index = parseInt(token, 10);
      if (isNaN(index) || index < 0) {
        return undefined;
      }
      current = current[index];
    } else {
      current = (current as Record<string, unknown>)[token];
    }
  }

  return current as T;
}

/**
 * Sets a value in an object using a JSON Pointer
 *
 * @param obj - The object to modify
 * @param pointer - The JSON Pointer string
 * @param value - The value to set
 * @returns A new object with the value set (immutable update)
 */
export function setValueByPointer<T extends DataModel | Record<string, unknown>>(
  obj: T,
  pointer: JsonPointer,
  value: unknown
): T {
  if (pointer === '') {
    return value as T;
  }

  const tokens = parsePointer(pointer);
  return setValueByTokens(obj, tokens, value) as T;
}

/**
 * Internal helper for immutable value setting
 */
function setValueByTokens(
  obj: unknown,
  tokens: string[],
  value: unknown
): unknown {
  if (tokens.length === 0) {
    return value;
  }

  const [currentToken, ...remainingTokens] = tokens;

  if (obj === null || obj === undefined) {
    // Create appropriate container
    const isArrayIndex = /^\d+$/.test(currentToken) || currentToken === '-';
    obj = isArrayIndex ? [] : {};
  }

  if (Array.isArray(obj)) {
    const newArray = [...obj];
    let index: number;

    if (currentToken === '-') {
      // Append to end
      index = newArray.length;
    } else {
      index = parseInt(currentToken, 10);
      if (isNaN(index) || index < 0) {
        throw new Error(`Invalid array index: ${currentToken}`);
      }
    }

    newArray[index] = setValueByTokens(newArray[index], remainingTokens, value);
    return newArray;
  }

  if (typeof obj === 'object') {
    return {
      ...obj,
      [currentToken]: setValueByTokens(
        (obj as Record<string, unknown>)[currentToken],
        remainingTokens,
        value
      ),
    };
  }

  throw new Error(`Cannot set property on non-object: ${typeof obj}`);
}

/**
 * Deletes a value from an object using a JSON Pointer
 *
 * @param obj - The object to modify
 * @param pointer - The JSON Pointer string
 * @returns A new object with the value removed (immutable update)
 */
export function deleteValueByPointer<T extends DataModel | Record<string, unknown>>(
  obj: T,
  pointer: JsonPointer
): T {
  if (pointer === '') {
    throw new Error('Cannot delete root object');
  }

  const tokens = parsePointer(pointer);
  return deleteValueByTokens(obj, tokens) as T;
}

/**
 * Internal helper for immutable value deletion
 */
function deleteValueByTokens(
  obj: unknown,
  tokens: string[]
): unknown {
  if (tokens.length === 0 || obj === null || obj === undefined) {
    return obj;
  }

  const [currentToken, ...remainingTokens] = tokens;

  if (Array.isArray(obj)) {
    const index = parseInt(currentToken, 10);
    if (isNaN(index) || index < 0 || index >= obj.length) {
      return obj;
    }

    if (remainingTokens.length === 0) {
      // Delete this element
      return [...obj.slice(0, index), ...obj.slice(index + 1)];
    }

    // Recurse
    const newArray = [...obj];
    newArray[index] = deleteValueByTokens(newArray[index], remainingTokens);
    return newArray;
  }

  if (typeof obj === 'object') {
    const record = obj as Record<string, unknown>;

    if (remainingTokens.length === 0) {
      // Delete this property - destructure to omit the key
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [currentToken]: _removed, ...rest } = record;
      return rest;
    }

    // Recurse
    return {
      ...record,
      [currentToken]: deleteValueByTokens(record[currentToken], remainingTokens),
    };
  }

  return obj;
}

/**
 * Checks if a value at a pointer exists
 */
export function hasValueAtPointer(
  obj: DataModel | Record<string, unknown>,
  pointer: JsonPointer
): boolean {
  if (pointer === '') return true;

  const tokens = parsePointer(pointer);
  let current: unknown = obj;

  for (const token of tokens) {
    if (current === null || current === undefined) {
      return false;
    }

    if (typeof current !== 'object') {
      return false;
    }

    if (Array.isArray(current)) {
      const index = parseInt(token, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return false;
      }
      current = current[index];
    } else {
      if (!(token in current)) {
        return false;
      }
      current = (current as Record<string, unknown>)[token];
    }
  }

  return true;
}

/**
 * Resolves a value that might be a JSON Pointer or a literal value
 * Used for A2UI data binding where values can be either direct or references
 */
export function resolveValue<T>(
  value: T | JsonPointer,
  dataModel: DataModel
): T {
  if (isJsonPointer(value)) {
    return getValueByPointer<T>(dataModel, value) as T;
  }
  return value;
}

/**
 * Gets the parent pointer and property name from a pointer
 */
export function getParentPointer(pointer: JsonPointer): { parent: JsonPointer; property: string } | null {
  if (pointer === '') return null;

  const tokens = parsePointer(pointer);
  if (tokens.length === 0) return null;

  const property = tokens.pop()!;
  const parent = compilePointer(tokens);

  return { parent, property };
}
