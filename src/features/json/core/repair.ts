/**
 * JSON repair. Uses the battle-tested `jsonrepair` library to fix common
 * mistakes: trailing commas, single quotes, unquoted keys, comments, missing
 * quotes, control characters, etc.
 *
 * Runs fully in the browser — nothing is sent to a server.
 */

import { jsonrepair } from "jsonrepair";
import type { RepairResult } from "./types";

/** Repair a broken JSON string. Never throws; returns a structured result. */
export function repairJSON(text: string): RepairResult {
  const input = typeof text === "string" ? text : String(text ?? "");
  try {
    const repaired = jsonrepair(input);
    // Guard: the repaired output must itself be valid JSON.
    JSON.parse(repaired);
    return { repaired, ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      repaired: "",
      ok: false,
      error: `无法修复此 JSON：${message}`,
    };
  }
}
