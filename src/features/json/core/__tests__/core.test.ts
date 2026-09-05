import { describe, expect, it } from "vitest";

import {
  formatJSON,
  isValidJSON,
  minifyJSON,
  offsetToLineColumn,
  parseJSON,
  scanJsonError,
  stringifyJSON,
  validateJSON,
} from "@/features/json/core";

describe("parseJSON — valid inputs", () => {
  it("parses a valid object", () => {
    const result = parseJSON('{"name": "json", "count": 2}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: "json", count: 2 });
    }
  });

  it("parses a valid array", () => {
    const result = parseJSON("[1, 2, 3]");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([1, 2, 3]);
  });

  it("parses deeply nested JSON", () => {
    const nested = '{"a":{"b":{"c":{"d":[{"e":true}]}}}}';
    expect(parseJSON(nested).ok).toBe(true);
  });

  it("parses unicode content", () => {
    const result = parseJSON('{"emoji":"🎉","chinese":"你好","mixed":"a\u00e9"}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ emoji: "🎉", chinese: "你好", mixed: "aé" });
  });

  it("parses escape characters", () => {
    const result = parseJSON('"tab:\\t newline:\\n quote:\\" slash:\\\\ backspace:\\b"');
    expect(result.ok).toBe(true);
  });

  it("parses a large integer", () => {
    const result = parseJSON("9007199254740993");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe(9007199254740993);
  });

  it("parses null, booleans and numbers", () => {
    expect(parseJSON("null").ok).toBe(true);
    expect(parseJSON("true").ok).toBe(true);
    expect(parseJSON("false").ok).toBe(true);
    expect(parseJSON("-12.5e3").ok).toBe(true);
  });

  it("parses an empty object and empty array", () => {
    expect(parseJSON("{}").ok).toBe(true);
    expect(parseJSON("[]").ok).toBe(true);
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseJSON("  \n\t {\"a\":1} \n ").ok).toBe(true);
  });
});

describe("parseJSON — invalid inputs with precise errors", () => {
  it("rejects unquoted property names", () => {
    const result = parseJSON("{a: 1}");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("属性名");
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBe(2); // at the `a`
    }
  });

  it("rejects trailing commas", () => {
    const result = parseJSON('{"a": 1,}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBe(9); // at the `}`
      expect(result.error.lineText).toBe('{"a": 1,}');
    }
  });

  it("rejects a missing comma between properties", () => {
    const result = parseJSON('{"a": 1 "b": 2}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("','");
  });

  it("rejects a missing colon", () => {
    const result = parseJSON('{"a" 1}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("':'");
  });

  it("rejects an unterminated string and reports line/column", () => {
    const result = parseJSON('{"a": "oops');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("未闭合");
      expect(result.error.line).toBe(1);
      expect(result.error.column).toBe(7); // at the opening quote
    }
  });

  it("rejects a raw control character inside a string", () => {
    const result = parseJSON('{\n  "a": "oops\n}');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("控制字符");
  });

  it("reports correct line and column across multiple lines", () => {
    const input = '{\n  "a": 1,\n  "b": \n}';
    const result = parseJSON(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.line).toBe(4);
      expect(result.error.column).toBe(1);
    }
  });

  it("rejects trailing content after a value", () => {
    const result = parseJSON("1 2");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("结束");
      expect(result.error.column).toBe(3);
    }
  });

  it("rejects empty input", () => {
    const result = parseJSON("");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("JSON 输入");
  });

  it("rejects single quotes", () => {
    const result = parseJSON("{'a': 1}");
    expect(result.ok).toBe(false);
  });

  it("rejects NaN and Infinity", () => {
    expect(parseJSON("NaN").ok).toBe(false);
    expect(parseJSON("Infinity").ok).toBe(false);
  });

  it("rejects raw control characters inside strings", () => {
    const result = parseJSON('["a\nb"]');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("控制字符");
  });

  it("rejects invalid escape sequences", () => {
    const result = parseJSON('"\\x41"');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toContain("转义");
  });

  it("produces a useful snippet around the error", () => {
    const result = parseJSON('{"aaa": 1, "bbb": 2, "ccc": oops}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.snippet.length).toBeGreaterThan(0);
      expect(result.error.lineText).toContain("oops");
    }
  });
});

describe("scanJsonError", () => {
  it("returns null for valid JSON", () => {
    expect(scanJsonError('{"a":[1,2,3]}')).toBeNull();
  });

  it("locates the offset of a violation", () => {
    const result = scanJsonError('{"a": 1,}');
    expect(result).not.toBeNull();
    expect(result!.offset).toBe(8);
  });
});

describe("offsetToLineColumn", () => {
  it("handles single line", () => {
    expect(offsetToLineColumn("abc", 2)).toEqual({ line: 1, column: 3 });
  });

  it("handles multi-line text", () => {
    expect(offsetToLineColumn("ab\ncd", 4)).toEqual({ line: 2, column: 2 });
  });

  it("handles offsets at the end of input", () => {
    expect(offsetToLineColumn("ab\ncd", 5)).toEqual({ line: 2, column: 3 });
  });
});

describe("formatJSON / stringifyJSON / minifyJSON", () => {
  const input = '{"b":2,"a":[1,2],"c":null}';

  it("formats with 2 spaces", () => {
    expect(formatJSON(input, 2)).toBe('{\n  "b": 2,\n  "a": [\n    1,\n    2\n  ],\n  "c": null\n}');
  });

  it("formats with 4 spaces", () => {
    const out = formatJSON(input, 4);
    expect(out).toContain('\n    "b": 2');
  });

  it("formats with tab indentation", () => {
    const out = formatJSON(input, "\t");
    expect(out).toContain('\n\t"b": 2');
  });

  it("stringifyJSON serializes a parsed value", () => {
    const value = parseJSON(input);
    expect(value.ok).toBe(true);
    if (value.ok) {
      expect(stringifyJSON(value.value, 2)).toBe(formatJSON(input, 2));
    }
  });

  it("minifies JSON", () => {
    expect(minifyJSON(input)).toBe('{"b":2,"a":[1,2],"c":null}');
  });

  it("minifyJSON removes whitespace from a pretty document", () => {
    const pretty = formatJSON(input, 2);
    expect(minifyJSON(pretty)).toBe('{"b":2,"a":[1,2],"c":null}');
  });

  it("throws detailed errors on invalid input", () => {
    expect(() => formatJSON("{a:1}")).toThrow(/属性名/);
    expect(() => minifyJSON("[1,]")).toThrow(/',' 后应为值/);
  });

  it("round-trips format → minify → format", () => {
    expect(formatJSON(minifyJSON(input), 2)).toBe(formatJSON(input, 2));
  });
});

describe("isValidJSON / validateJSON", () => {
  it("validates valid and invalid input", () => {
    expect(isValidJSON('{"ok": true}')).toBe(true);
    expect(isValidJSON("{ok: true}")).toBe(false);
  });

  it("returns the parsed value when valid", () => {
    const result = validateJSON('["a", "b"]');
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.value).toEqual(["a", "b"]);
  });

  it("returns detailed error info when invalid", () => {
    const result = validateJSON("{");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toBeTruthy();
      expect(result.error.line).toBeGreaterThanOrEqual(1);
    }
  });
});
