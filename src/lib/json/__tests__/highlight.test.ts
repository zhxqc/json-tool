import { describe, expect, it } from "vitest";

import { tokenizeJSON } from "@/lib/json/highlight";

describe("tokenizeJSON", () => {
  it("classifies keys, strings, numbers, booleans and null", () => {
    const tokens = tokenizeJSON('{"k": "v", "n": 1.5, "t": true, "f": false, "x": null}');
    const kinds = tokens.map((t) => `${t.type}:${t.value}`);
    expect(kinds).toContain('key:"k"');
    expect(kinds).toContain('string:"v"');
    expect(kinds).toContain("number:1.5");
    expect(kinds).toContain("boolean:true");
    expect(kinds).toContain("boolean:false");
    expect(kinds).toContain("null:null");
  });

  it("does not mark array strings as keys", () => {
    const tokens = tokenizeJSON('["a", "b"]');
    const strings = tokens.filter((t) => t.type === "string");
    expect(strings.length).toBe(2);
    expect(tokens.filter((t) => t.type === "key").length).toBe(0);
  });

  it("handles nested structures", () => {
    const tokens = tokenizeJSON('{"a": {"b": [1, {"c": true}]}}');
    expect(tokens.some((t) => t.type === "key" && t.value === '"b"')).toBe(true);
    expect(tokens.some((t) => t.type === "key" && t.value === '"c"')).toBe(true);
  });

  it("keeps escaped strings intact", () => {
    const tokens = tokenizeJSON('{"a": "line\\nbreak \\" quote"}');
    const str = tokens.find((t) => t.type === "string");
    expect(str?.value).toContain('\\n');
    expect(str?.value).toContain('\\"');
  });

  it("does not crash on invalid JSON", () => {
    expect(() => tokenizeJSON('{a: 1,}')).not.toThrow();
  });
});
