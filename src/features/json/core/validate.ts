/**
 * JSON validation. Thin wrapper around the shared parser so callers can use a
 * dedicated, self-documenting API and always get detailed error information.
 */

import { parseJSON } from "./parse";
import type { JsonValue, ValidateResult } from "./types";

/** Validate a JSON string. Returns `{ valid, value }` or `{ valid, error }`. */
export function validateJSON(text: string): ValidateResult {
  const parsed = parseJSON(text);
  if (parsed.ok) {
    return { valid: true, value: parsed.value as JsonValue };
  }
  return { valid: false, error: parsed.error };
}
