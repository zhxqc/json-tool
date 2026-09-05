import { describe, expect, it } from "vitest";

import { repairJSON } from "@/features/json/core";

describe("repairJSON", () => {
  it("removes a trailing comma in an object", () => {
    const result = repairJSON('{"a": 1,}');
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ a: 1 });
  });

  it("removes a trailing comma in an array", () => {
    const result = repairJSON("[1, 2, 3,]");
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual([1, 2, 3]);
  });

  it("fixes unquoted keys", () => {
    const result = repairJSON("{name: \"json\"}");
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ name: "json" });
  });

  it("fixes single quotes", () => {
    const result = repairJSON("{'a': 'b'}");
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ a: "b" });
  });

  it("strips comments", () => {
    const result = repairJSON("{/* note */ \"a\": 1 // trailing\n}");
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ a: 1 });
  });

  it("fixes a missing value after a comma", () => {
    const result = repairJSON('{"a": 1, "b":}');
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ a: 1, b: null });
  });

  it("leaves already-valid JSON unchanged in value", () => {
    const result = repairJSON('{"a": 1}');
    expect(result.ok).toBe(true);
    expect(JSON.parse(result.repaired)).toEqual({ a: 1 });
  });

  it("returns a valid, re-parsable document", () => {
    const result = repairJSON("{ a: 1, b: [1,2,] }");
    expect(result.ok).toBe(true);
    expect(() => JSON.parse(result.repaired)).not.toThrow();
  });

  it("reports failure when repair is impossible (empty input)", () => {
    const result = repairJSON("");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
