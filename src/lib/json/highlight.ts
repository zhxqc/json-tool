/**
 * Lightweight JSON syntax highlighter for plain-text JSON.
 *
 * Turns a JSON string into an array of tokens that the UI can render as
 * colored spans. This is deliberately a small hand-rolled tokenizer (no
 * dependencies) so the formatted output view stays fast and SSR-friendly.
 */

export type JsonTokenType =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punctuation"
  | "whitespace";

export interface JsonToken {
  type: JsonTokenType;
  value: string;
}

const WHITESPACE_RE = /[\s\uFEFF\u00A0]/;

/** Tokenize a JSON string into display tokens. Works on invalid JSON too. */
export function tokenizeJSON(text: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;
  const len = text.length;

  while (i < len) {
    const c = text[i];

    // Whitespace
    if (WHITESPACE_RE.test(c)) {
      let j = i;
      while (j < len && WHITESPACE_RE.test(text[j])) j++;
      tokens.push({ type: "whitespace", value: text.slice(i, j) });
      i = j;
      continue;
    }

    // String
    if (c === '"') {
      let j = i + 1;
      while (j < len) {
        if (text[j] === "\\") {
          j += 2;
          continue;
        }
        if (text[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: "string", value: text.slice(i, j) });
      i = j;
      continue;
    }

    // Number
    if (c === "-" || (c >= "0" && c <= "9")) {
      let j = i;
      if (text[j] === "-") j++;
      while (j < len && /[0-9]/.test(text[j])) j++;
      if (text[j] === ".") {
        j++;
        while (j < len && /[0-9]/.test(text[j])) j++;
      }
      if (text[j] === "e" || text[j] === "E") {
        j++;
        if (text[j] === "+" || text[j] === "-") j++;
        while (j < len && /[0-9]/.test(text[j])) j++;
      }
      tokens.push({ type: "number", value: text.slice(i, j) });
      i = j;
      continue;
    }

    // Keywords
    if (/[a-zA-Z]/.test(c)) {
      const word = /[a-zA-Z]+/.exec(text.slice(i))![0];
      const type: JsonTokenType =
        word === "true" || word === "false" ? "boolean" : word === "null" ? "null" : "punctuation";
      tokens.push({ type, value: word });
      i += word.length;
      continue;
    }

    // Punctuation
    tokens.push({ type: "punctuation", value: c });
    i++;
  }

  // Mark strings that act as object keys (the next non-whitespace token is ':').
  for (let t = 0; t < tokens.length; t++) {
    if (tokens[t].type === "string") {
      let n = t + 1;
      while (n < tokens.length && tokens[n].type === "whitespace") n++;
      if (tokens[n]?.type === "punctuation" && tokens[n].value === ":") {
        tokens[t].type = "key";
      }
    }
  }

  return tokens;
}
