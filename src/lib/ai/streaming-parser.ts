/**
 * Streaming JSON Parser for A2UI
 *
 * Extracts A2UI JSON from streaming LLM responses
 */

import type { A2UIDocument } from '@/lib/a2ui/types';

interface ParseResult {
  text: string;
  jsonBlocks: string[];
  documents: A2UIDocument[];
  isComplete: boolean;
}

/**
 * Extracts JSON code blocks from markdown-formatted text
 */
export function extractJsonBlocks(text: string): string[] {
  const blocks: string[] = [];
  const regex = /```json\s*([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

/**
 * Attempts to parse a string as an A2UI document
 */
export function parseA2UIDocument(json: string): A2UIDocument | null {
  try {
    const parsed = JSON.parse(json);

    // Basic validation
    if (!parsed.root || !parsed.components) {
      return null;
    }

    // Ensure required fields
    return {
      version: parsed.version || '1.0',
      root: parsed.root,
      components: parsed.components,
      dataModel: parsed.dataModel || {},
      meta: parsed.meta || {},
    };
  } catch {
    return null;
  }
}

/**
 * Parses streaming text and extracts A2UI documents
 */
export function parseStreamingResponse(text: string): ParseResult {
  const jsonBlocks = extractJsonBlocks(text);
  const documents: A2UIDocument[] = [];

  for (const block of jsonBlocks) {
    const doc = parseA2UIDocument(block);
    if (doc) {
      documents.push(doc);
    }
  }

  // Check if the response seems complete (has closing markdown fence)
  const isComplete = text.includes('```json') && text.split('```').length % 2 === 1;

  return {
    text,
    jsonBlocks,
    documents,
    isComplete,
  };
}

/**
 * Attempts partial JSON parsing for incomplete streams
 * Useful for showing preview while still streaming
 */
export function parsePartialJson(json: string): Partial<A2UIDocument> | null {
  // Try to fix common incomplete JSON issues
  let fixed = json.trim();

  // Add missing closing braces/brackets
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/]/g) || []).length;

  // Add missing closings
  fixed += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
  fixed += '}'.repeat(Math.max(0, openBraces - closeBraces));

  // Remove trailing comma before closing
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  try {
    return JSON.parse(fixed);
  } catch {
    return null;
  }
}

/**
 * Streaming parser class for incremental parsing
 */
export class StreamingA2UIParser {
  private buffer: string = '';
  private lastValidDocument: A2UIDocument | null = null;

  /**
   * Append new chunk to buffer and attempt parsing
   */
  append(chunk: string): A2UIDocument | null {
    this.buffer += chunk;

    // Try to extract complete JSON blocks
    const result = parseStreamingResponse(this.buffer);

    if (result.documents.length > 0) {
      this.lastValidDocument = result.documents[result.documents.length - 1];
      return this.lastValidDocument;
    }

    // Try partial parsing if we're inside a JSON block
    const jsonMatch = this.buffer.match(/```json\s*([\s\S]*?)$/);
    if (jsonMatch) {
      const partial = parsePartialJson(jsonMatch[1]);
      if (partial && partial.root && partial.components) {
        this.lastValidDocument = partial as A2UIDocument;
        return this.lastValidDocument;
      }
    }

    return null;
  }

  /**
   * Get the current buffer content
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Get the last valid document parsed
   */
  getLastDocument(): A2UIDocument | null {
    return this.lastValidDocument;
  }

  /**
   * Reset the parser state
   */
  reset(): void {
    this.buffer = '';
    this.lastValidDocument = null;
  }

  /**
   * Finalize parsing and return the complete result
   */
  finalize(): ParseResult {
    return parseStreamingResponse(this.buffer);
  }
}
