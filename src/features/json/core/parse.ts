/**
 * JSON parsing with precise, human-friendly error reporting.
 *
 * `JSON.parse` is the source of truth for correctness. When it fails we run a
 * strict JSON scanner over the same text to locate the exact offset of the
 * first violation, then convert that offset into line / column / context.
 * This gives developers actionable errors ("line 3, column 8, near …") instead
 * of a bare "Invalid JSON".
 */

import type { JsonErrorInfo, JsonParseResult, JsonValue } from "./types";

/** Thrown internally by the scanner to carry the error location. */
class ScanError extends Error {
  offset: number;
  constructor(message: string, offset: number) {
    super(message);
    this.offset = offset;
  }
}

const WHITESPACE = /[\s\uFEFF\u00A0]/;

export function parseJSON(text: string): JsonParseResult {
  const input = typeof text === "string" ? text : String(text ?? "");
  try {
    const value = JSON.parse(input) as JsonValue;
    return { ok: true, value };
  } catch (nativeError) {
    return { ok: false, error: locateJsonError(input, nativeError) };
  }
}

/**
 * Best effort location of a JSON error. Prefers our own strict scanner (works
 * for every engine and message format), falls back to parsing the position out
 * of the native V8 message when available.
 */
export function locateJsonError(text: string, nativeError: unknown): JsonErrorInfo {
  const scanned = scanJsonError(text);
  if (scanned) {
    return buildErrorInfo(text, scanned.offset, scanned.message);
  }

  const message = nativeError instanceof Error ? nativeError.message : String(nativeError);
  const match = /position\s+(\d+)/.exec(message);
  if (match) {
    const offset = Math.min(Number(match[1]), text.length);
    return buildErrorInfo(text, offset, humanizeMessage(message));
  }

  return buildErrorInfo(text, 0, humanizeMessage(message));
}

function humanizeMessage(raw: string): string {
  // "Unexpected token } in JSON at position 5 (line 1 column 6)"
  let msg = raw.replace(/\s+in JSON at position \d+( \(line \d+ column \d+\))?\s*$/i, "");
  msg = msg.replace(/, ".*" is not valid JSON$/i, "");
  return msg || "无效 JSON";
}

function buildErrorInfo(text: string, offset: number, message: string): JsonErrorInfo {
  const safeOffset = Math.max(0, Math.min(offset, text.length));
  const { line, column } = offsetToLineColumn(text, safeOffset);
  const lineText = getLineAt(text, safeOffset);

  const SNIPPET_RADIUS = 40;
  const start = Math.max(0, safeOffset - SNIPPET_RADIUS);
  const end = Math.min(text.length, safeOffset + SNIPPET_RADIUS);
  const snippet = text.slice(start, end);

  return {
    message,
    line,
    column,
    offset: safeOffset,
    snippet,
    snippetBefore: start,
    lineText,
  };
}

/** Convert a 0-based character offset into 1-based line and column numbers. */
export function offsetToLineColumn(text: string, offset: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(offset, text.length);
  for (let i = 0; i < end; i++) {
    if (text.charCodeAt(i) === 10 /* \n */) {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function getLineAt(text: string, offset: number): string {
  const safe = Math.min(offset, text.length);
  let start = safe;
  let end = safe;
  while (start > 0 && text.charCodeAt(start - 1) !== 10) start--;
  while (end < text.length && text.charCodeAt(end) !== 10) end++;
  return text.slice(start, end);
}

/* ------------------------------------------------------------------ */
/* Strict JSON scanner                                                */
/* ------------------------------------------------------------------ */

interface ScanResult {
  offset: number;
  message: string;
}

/**
 * Walk `text` as strict JSON and return the location + reason of the first
 * violation. Returns `null` when no violation is found (defensive: callers
 * only run this after `JSON.parse` already failed).
 */
export function scanJsonError(text: string): ScanResult | null {
  const s = new Scanner(text);
  try {
    s.skipWs();
    if (s.atEnd()) {
      throw new ScanError("JSON 输入意外结束", s.pos);
    }
    s.scanValue();
    s.skipWs();
    if (!s.atEnd()) {
      throw new ScanError(
        `JSON 结束后出现多余字符：${s.tokenLabel()}`,
        s.pos
      );
    }
    return null;
  } catch (error) {
    if (error instanceof ScanError) {
      return { offset: error.offset, message: error.message };
    }
    throw error;
  }
}

class Scanner {
  readonly text: string;
  pos = 0;

  constructor(text: string) {
    this.text = text;
  }

  atEnd(): boolean {
    return this.pos >= this.text.length;
  }

  peek(offset = 0): string {
    return this.text[this.pos + offset] ?? "";
  }

  skipWs(): void {
    while (!this.atEnd() && WHITESPACE.test(this.text[this.pos])) this.pos++;
  }

  tokenLabel(): string {
    const c = this.peek();
    return c === "" ? "输入结束" : `'${c}'`;
  }

  scanValue(): void {
    this.skipWs();
    const c = this.peek();
    if (this.atEnd()) {
      throw new ScanError("JSON 输入意外结束", this.pos);
    }
    if (c === "{") return this.scanObject();
    if (c === "[") return this.scanArray();
    if (c === '"') return this.scanString();
    if (c === "-" || (c >= "0" && c <= "9")) return this.scanNumber();
    if (c === "t" || c === "f" || c === "n") return this.scanKeyword();
    throw new ScanError(`意外的字符 ${this.tokenLabel()}`, this.pos);
  }

  scanObject(): void {
    this.pos++; // consume '{'
    this.skipWs();
    if (this.peek() === "}") {
      this.pos++;
      return;
    }
    for (;;) {
      this.skipWs();
      if (this.peek() !== '"') {
        throw new ScanError("此处应为属性名或 '}'", this.pos);
      }
      this.scanString(); // key
      this.skipWs();
      if (this.peek() !== ":") {
        throw new ScanError("属性名后应为 ':'", this.pos);
      }
      this.pos++; // consume ':'
      this.scanValue();
      this.skipWs();
      const c = this.peek();
      if (c === ",") {
        this.pos++;
        this.skipWs();
        if (this.peek() === "}" || this.atEnd()) {
          throw new ScanError("',' 后应为属性名", this.pos);
        }
        continue;
      }
      if (c === "}") {
        this.pos++;
        return;
      }
      throw new ScanError("属性值后应为 ',' 或 '}'", this.pos);
    }
  }

  scanArray(): void {
    this.pos++; // consume '['
    this.skipWs();
    if (this.peek() === "]") {
      this.pos++;
      return;
    }
    for (;;) {
      this.skipWs();
      this.scanValue();
      this.skipWs();
      const c = this.peek();
      if (c === ",") {
        this.pos++;
        this.skipWs();
        if (this.peek() === "]" || this.atEnd()) {
          throw new ScanError("',' 后应为值", this.pos);
        }
        continue;
      }
      if (c === "]") {
        this.pos++;
        return;
      }
      throw new ScanError("数组元素后应为 ',' 或 ']'", this.pos);
    }
  }

  scanString(): void {
    const start = this.pos;
    this.pos++; // consume opening quote
    for (;;) {
      if (this.atEnd()) {
        throw new ScanError("字符串未闭合", start);
      }
      const c = this.text[this.pos];
      if (c === '"') {
        this.pos++;
        return;
      }
      if (c === "\\") {
        this.scanEscape();
        continue;
      }
      const code = this.text.charCodeAt(this.pos);
      if (code < 0x20) {
        throw new ScanError("字符串中包含未转义的控制字符", this.pos);
      }
      this.pos++;
    }
  }

  scanEscape(): void {
    this.pos++; // consume backslash
    if (this.atEnd()) {
      throw new ScanError("字符串未闭合", this.pos - 1);
    }
    const c = this.text[this.pos];
    if ('"\\/bfnrt'.includes(c)) {
      this.pos++;
      return;
    }
    if (c === "u") {
      this.pos++;
      for (let i = 0; i < 4; i++) {
        const h = this.text[this.pos + i] ?? "";
        if (!/[0-9a-fA-F]/.test(h)) {
          throw new ScanError("字符串中的 Unicode 转义无效", this.pos + i);
        }
      }
      this.pos += 4;
      return;
    }
    throw new ScanError(`字符串中包含无效的转义字符 '${c}'`, this.pos);
  }

  scanNumber(): void {
    if (this.peek() === "-") this.pos++;
    // integer part
    if (this.peek() === "0") {
      this.pos++;
    } else if (/[1-9]/.test(this.peek())) {
      this.pos++;
      while (/[0-9]/.test(this.peek())) this.pos++;
    } else {
      throw new ScanError("无效的数字", this.pos);
    }
    // fraction
    if (this.peek() === ".") {
      this.pos++;
      if (!/[0-9]/.test(this.peek())) {
        throw new ScanError("无效的数字", this.pos);
      }
      while (/[0-9]/.test(this.peek())) this.pos++;
    }
    // exponent
    if (this.peek() === "e" || this.peek() === "E") {
      this.pos++;
      if (this.peek() === "+" || this.peek() === "-") this.pos++;
      if (!/[0-9]/.test(this.peek())) {
        throw new ScanError("无效的数字", this.pos);
      }
      while (/[0-9]/.test(this.peek())) this.pos++;
    }
  }

  scanKeyword(): void {
    const keywords: Record<string, string> = { t: "true", f: "false", n: "null" };
    const keyword = keywords[this.peek()] ?? "";
    if (this.text.startsWith(keyword, this.pos)) {
      this.pos += keyword.length;
      const next = this.peek();
      if (next === "" || WHITESPACE.test(next) || ",]}".includes(next) || next === ":") {
        return;
      }
      throw new ScanError(`意外的字符 '${next}'`, this.pos);
    }
    throw new ScanError(`意外的字符 ${this.tokenLabel()}`, this.pos);
  }
}
