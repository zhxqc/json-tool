/**
 * JSON formatting and minification.
 *
 * Formatting is deterministic: it parses the input and re-serializes with a
 * chosen indentation (2 spaces, 4 spaces or a tab). Minification strips all
 * insignificant whitespace. Both throw a `JsonErrorInfo` on invalid input via
 * the shared parser.
 */

import { parseJSON } from "./parse";
import type { Indentation, JsonErrorInfo, JsonValue } from "./types";

const INDENT_STRINGS: Record<Indentation, string> = {
  2: "  ",
  4: "    ",
  "\t": "\t",
};

/** True when `text` is syntactically valid JSON. */
export function isValidJSON(text: string): boolean {
  return parseJSON(text).ok;
}

/**
 * Format a JSON string with the given indentation.
 * @throws {JsonErrorInfo} when the input is not valid JSON.
 */
export function formatJSON(text: string, indentation: Indentation = 2): string {
  const parsed = parseJSON(text);
  if (!parsed.ok) {
    throw parsed.error as JsonErrorInfo;
  }
  return stringifyJSON(parsed.value, indentation);
}

/** Serialize a parsed JSON value with the given indentation. */
export function stringifyJSON(value: JsonValue, indentation: Indentation = 2): string {
  const result = JSON.stringify(value, null, INDENT_STRINGS[indentation]);
  if (result === undefined) {
    // Only happens for top-level undefined, which cannot come from JSON.parse.
    return "undefined";
  }
  return result;
}

/**
 * Minify a JSON string (remove all insignificant whitespace).
 * @throws {JsonErrorInfo} when the input is not valid JSON.
 */
export function minifyJSON(text: string): string {
  const parsed = parseJSON(text);
  if (!parsed.ok) {
    throw parsed.error as JsonErrorInfo;
  }
  return JSON.stringify(parsed.value);
}
