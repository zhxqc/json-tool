"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ListCollapse, ListTree } from "lucide-react";

import { cn } from "@/lib/utils";

import type { JsonValue } from "@/features/json/core";

/**
 * Lightweight, purpose-built JSON tree viewer.
 *
 * Unlike a full-blown JSON editor, this is a read-only structural viewer: every
 * object `{ }` and array `[ ]` node gets an explicit expand/collapse toggle, and
 * two toolbar actions ("展开全部" / "收起全部") operate on the whole tree. It is
 * rendered client-side from an already-parsed `JsonValue`, reusing the same
 * `text-json-*` color tokens as the text highlighter.
 *
 * Collapse state is keyed by the node's index path (e.g. `0/1/2`), which is
 * unambiguous even when object keys contain dots or brackets. Stale paths from
 * earlier parses are harmless — toggles only look up paths that exist in the
 * current render.
 */

type CollapseState = Set<string>;

function isContainer(value: JsonValue): value is Record<string, JsonValue> | JsonValue[] {
  return value !== null && typeof value === "object";
}

function isEmptyContainer(value: Record<string, JsonValue> | JsonValue[]): boolean {
  return Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0;
}

function childPath(path: string, index: number, isArrayItem: boolean): string {
  const key = isArrayItem ? `[${index}]` : String(index);
  return path ? `${path}/${key}` : key;
}

/** Value rendering with syntax colors, mirroring the text highlighter. */
function LeafValue({ value }: { value: JsonValue }) {
  if (value === null) {
    return <span className="text-json-null">null</span>;
  }
  if (typeof value === "string") {
    return <span className="text-json-string">{JSON.stringify(value)}</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-json-boolean">{String(value)}</span>;
  }
  return <span className="text-json-number">{String(value)}</span>;
}

interface NodeProps {
  /** Object key (shown in key color) or array index (shown muted). */
  label: string | null;
  isIndex: boolean;
  value: JsonValue;
  path: string;
  collapsed: CollapseState;
  onToggle: (path: string) => void;
}

function JsonTreeNode({ label, isIndex, value, path, collapsed, onToggle }: NodeProps) {
  // Leaf or empty container — render as a single row.
  if (!isContainer(value) || isEmptyContainer(value)) {
    const container = isContainer(value);
    const summary = container ? (Array.isArray(container) ? "[ ]" : "{ }") : null;
    return (
      <div className="flex items-baseline gap-1.5 whitespace-pre py-[1px]">
        <span className="w-4 shrink-0" aria-hidden="true" />
        {label !== null && (
          <span className={isIndex ? "text-muted-foreground/70" : "text-json-key"}>{label}:</span>
        )}
        {summary ? (
          <span className="text-foreground/70">{summary}</span>
        ) : (
          <LeafValue value={value} />
        )}
      </div>
    );
  }

  const container = value;
  const closed = collapsed.has(path);
  const entries = Array.isArray(container)
    ? container.map((item, i) => ({ index: i, isIndex: true, value: item, key: "" }))
    : Object.entries(container).map(([k, v], i) => ({ index: i, isIndex: false, value: v, key: k }));
  const labelText = Array.isArray(container)
    ? `${container.length} 项`
    : `${Object.keys(container).length} 个键`;

  return (
    <div>
      <div className="flex items-center gap-1.5 whitespace-pre py-[1px]">
        <button
          type="button"
          onClick={() => onToggle(path)}
          aria-expanded={!closed}
          aria-label={`${closed ? "展开" : "收起"} ${label ?? "根节点"}`}
          className="flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {closed ? (
            <ChevronRight aria-hidden="true" className="size-3.5" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-3.5" />
          )}
        </button>
        {label !== null && (
          <span className={isIndex ? "text-muted-foreground/70" : "text-json-key"}>{label}:</span>
        )}
        {closed ? (
          <span className="text-foreground/80">
            {Array.isArray(container) ? "[" : "{"} {labelText} {Array.isArray(container) ? "]" : "}"}
          </span>
        ) : (
          <span className="text-foreground/60">{Array.isArray(container) ? "[" : "{"}</span>
        )}
      </div>
      {!closed && (
        <div className="ml-[7px] border-l border-border/60 pl-3">
          {entries.map((entry) => (
            <JsonTreeNode
              key={entry.isIndex ? `i${entry.index}` : `k${entry.key}`}
              label={entry.isIndex ? String(entry.index) : `"${entry.key}"`}
              isIndex={entry.isIndex}
              value={entry.value}
              path={childPath(path, entry.index, entry.isIndex)}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
          <div className="whitespace-pre text-foreground/60">{Array.isArray(container) ? "]" : "}"}</div>
        </div>
      )}
    </div>
  );
}

function collectPaths(value: JsonValue, path: string, paths: string[]): void {
  if (!isContainer(value)) return;
  paths.push(path);
  const entries = Array.isArray(value)
    ? value.map((item, i) => ({ index: i, isArray: true, value: item }))
    : Object.entries(value).map(([, v], i) => ({ index: i, isArray: false, value: v }));
  for (const entry of entries) {
    if (isContainer(entry.value)) {
      collectPaths(entry.value, childPath(path, entry.index, entry.isArray), paths);
    }
  }
}

export interface JsonTreeViewProps {
  value: JsonValue;
  ariaLabel?: string;
  className?: string;
}

export function JsonTreeView({ value, ariaLabel = "JSON 树形视图", className }: JsonTreeViewProps) {
  const [collapsed, setCollapsed] = useState<CollapseState>(() => new Set());

  const containerPaths = useMemo(() => {
    const paths: string[] = [];
    collectPaths(value, "", paths);
    return paths;
  }, [value]);

  const toggle = useCallback((path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsed(new Set(containerPaths));
  }, [containerPaths]);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  const hasCollapsed = collapsed.size > 0;
  const hasContainers = containerPaths.length > 0;
  // "收起全部" is only pointless once every container is already collapsed.
  const allCollapsed = hasContainers && collapsed.size >= containerPaths.length;

  return (
    <div
      role="tree"
      aria-label={ariaLabel}
      className={cn("json-mono h-full overflow-auto p-3 text-[13px] leading-[1.55]", className)}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={collapseAll}
          disabled={allCollapsed}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <ListCollapse aria-hidden="true" className="size-3" />
          收起全部
        </button>
        <button
          type="button"
          onClick={expandAll}
          disabled={!hasCollapsed}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <ListTree aria-hidden="true" className="size-3" />
          展开全部
        </button>
      </div>
      <JsonTreeNode label={null} isIndex={false} value={value} path="" collapsed={collapsed} onToggle={toggle} />
    </div>
  );
}
