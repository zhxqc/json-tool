"use client";

import { useMemo, useRef, useState } from "react";
import {
  Braces,
  Check,
  Copy,
  Eraser,
  ListTree,
  Shrink,
  Wrench,
} from "lucide-react";

import { Segmented } from "@/components/segmented";
import { Button } from "@/components/ui/button";
import { JsonErrorPanel } from "@/features/json/components/error-panel";
import {
  parseJSON,
  repairJSON,
  stringifyJSON,
  type Indentation,
  type JsonValue,
} from "@/features/json/core";
import { JsonTreeView } from "@/features/json/tree/json-tree";
import { copyText } from "@/lib/json/clipboard";

import { HighlightedJson } from "./highlighted-json";

type OutputMode = "formatted" | "minified";
type View = "text" | "tree";

const SAMPLE_JSON = `{
  "name": "json.imnice.top",
  "tools": ["format", "validate", "minify", "repair"],
  "privacy": true,
  "metrics": {
    "requests": 1200,
    "p95": 42.5,
    "nullable": null
  }
}`;

function describeValue(value: JsonValue): string {
  if (Array.isArray(value)) return `数组 · ${value.length} 项`;
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    return `对象 · ${keys.length} 个键`;
  }
  if (typeof value === "string") return "字符串";
  if (typeof value === "number") return "数字";
  if (typeof value === "boolean") return "布尔值";
  return "null";
}

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
  const [indent, setIndent] = useState<Indentation>(2);
  const [view, setView] = useState<View>("tree");
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsed = useMemo(() => parseJSON(input), [input]);
  const isEmpty = input.trim().length === 0;

  const outputText = useMemo(() => {
    if (!parsed.ok) return "";
    return outputMode === "formatted"
      ? stringifyJSON(parsed.value, indent)
      : JSON.stringify(parsed.value);
  }, [parsed, outputMode, indent]);

  function handleFormat() {
    setOutputMode("formatted");
    setNotice(null);
  }

  function handleMinify() {
    setOutputMode("minified");
    setNotice(null);
  }

  function handleRepair() {
    const result = repairJSON(input);
    if (result.ok) {
      setInput(result.repaired);
      setOutputMode("formatted");
      setNotice("已自动修复 JSON。");
    } else {
      setNotice(result.error ?? "无法修复此 JSON。");
    }
  }

  function handleCopy() {
    if (!outputText) return;
    void copyText(outputText).then((ok) => {
      if (ok) {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1500);
      } else {
        setNotice("复制失败，请手动选择文本复制。");
      }
    });
  }

  function handleClear() {
    setInput("");
    setNotice(null);
    setCopied(false);
  }

  function handleLoadSample() {
    setInput(SAMPLE_JSON);
    setOutputMode("formatted");
    setNotice(null);
  }

  const showError = !isEmpty && !parsed.ok;
  const error = showError ? parsed.error : null;

  // 输入是 JSON5 类宽松写法、且可被自动修复时，错误面板提供“一键修复”。
  const canRepair = useMemo(() => {
    if (parsed.ok || isEmpty) return false;
    return repairJSON(input).ok;
  }, [parsed, isEmpty, input]);

  return (
    <section aria-label="JSON 格式化与查看" className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:flex-1">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted px-3 py-2">
        <Button variant="default" size="sm" onClick={handleFormat} disabled={isEmpty || !parsed.ok}>
          <Braces aria-hidden="true" />
          格式化
        </Button>
        <Button variant="secondary" size="sm" onClick={handleRepair} disabled={isEmpty}>
          <Wrench aria-hidden="true" />
          修复
        </Button>
        <Button variant="secondary" size="sm" onClick={handleMinify} disabled={isEmpty || !parsed.ok}>
          <Shrink aria-hidden="true" />
          压缩
        </Button>

        <div className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

        <span className="text-xs text-muted-foreground">缩进</span>
        <Segmented<Indentation>
          ariaLabel="缩进"
          options={[
            { value: 2, label: "2 空格", title: "以 2 个空格缩进" },
            { value: 4, label: "4 空格", title: "以 4 个空格缩进" },
            { value: "\t", label: "Tab", title: "以 Tab 缩进" },
          ]}
          value={indent}
          onChange={setIndent}
        />

        <div className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

        <Segmented<View>
          ariaLabel="输出视图"
          options={[
            { value: "text", label: "文本" },
            { value: "tree", label: "树形" },
          ]}
          value={view}
          onChange={setView}
        />

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!outputText}
            aria-label="复制输出"
            title="复制输出"
          >
            {copied ? <Check aria-hidden="true" className="text-emerald-500" /> : <Copy aria-hidden="true" />}
            复制
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            disabled={isEmpty}
            aria-label="清空输入"
            title="清空输入"
          >
            <Eraser aria-hidden="true" />
            清空
          </Button>
        </div>
      </div>

      {/* Panels */}
      <div className="flex min-h-0 flex-col md:flex-1 md:flex-row md:divide-x md:divide-border">
        {/* Input */}
        <div className="flex min-h-0 flex-col bg-background md:flex-1">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
            <label htmlFor="json-input" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              输入
            </label>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              加载示例
            </button>
          </div>
          <textarea
            id="json-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setNotice(null);
            }}
            placeholder={`在此粘贴你的 JSON…\n\n示例：\n{"name": "json", "valid": true}`}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="json-mono h-96 w-full resize-none bg-transparent p-4 text-[13px] leading-[1.6] text-foreground placeholder:text-muted-foreground focus-visible:outline-none md:h-auto md:min-h-0 md:flex-1"
          />
        </div>

        {/* Output */}
        <div className="flex min-h-0 flex-col md:flex-1">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {view === "tree" ? <ListTree aria-hidden="true" className="size-3.5" /> : <Braces aria-hidden="true" className="size-3.5" />}
              {outputMode === "formatted" ? "已格式化" : "已压缩"}
              {view === "tree" ? " · 树形" : " · 文本"}
            </span>
          </div>

          <div className="relative h-96 bg-background md:h-auto md:min-h-0 md:flex-1" role="status" aria-live="polite">
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                <Braces aria-hidden="true" className="size-6 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  格式化结果将显示在这里，请在左侧粘贴或输入 JSON。
                </p>
              </div>
            ) : showError ? (
              <JsonErrorPanel error={error!} repairable={canRepair} onRepair={handleRepair} />
            ) : view === "tree" && parsed.ok ? (
              <JsonTreeView value={parsed.value} />
            ) : (
              <HighlightedJson text={outputText} />
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
        {isEmpty ? (
          <span>请粘贴 JSON 开始。</span>
        ) : parsed.ok ? (
          <>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              有效 JSON
            </span>
            <span>{describeValue(parsed.value)}</span>
            <span>{outputText.length.toLocaleString()} 个字符</span>
          </>
        ) : (
          <span className="text-destructive">
            {parsed.error.message} — 第 {parsed.error.line} 行，第 {parsed.error.column} 列
          </span>
        )}
        {notice && <span className="text-amber-600 dark:text-amber-400">{notice}</span>}
      </div>
    </section>
  );
}
