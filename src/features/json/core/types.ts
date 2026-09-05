/**
 * Shared types for the JSON tool core.
 *
 * This module is framework-agnostic (no React / Next.js imports) so the
 * parsing, formatting, validation and repair logic can run anywhere:
 * browser, Node, unit tests.
 */

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** Detailed, human-friendly error produced by the JSON scanner. */
export interface JsonErrorInfo {
  /** Short human readable message, e.g. "Unexpected token ']'". */
  message: string;
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  column: number;
  /** 0-based character offset into the original text. */
  offset: number;
  /** A short context window around the error (never the whole document). */
  snippet: string;
  /** Number of characters before the snippet. */
  snippetBefore: number;
  /** Full text of the line that contains the error (for caret rendering). */
  lineText: string;
}

export type JsonParseResult =
  | { ok: true; value: JsonValue }
  | { ok: false; error: JsonErrorInfo };

export type Indentation = 2 | 4 | "\t";

export interface FormatOptions {
  indentation: Indentation;
}

export type ValidateResult =
  | { valid: true; value: JsonValue }
  | { valid: false; error: JsonErrorInfo };

export interface RepairResult {
  /** The repaired JSON text (valid JSON when `ok` is true). */
  repaired: string;
  ok: boolean;
  /** Explanation, present when repair failed. */
  error?: string;
}
