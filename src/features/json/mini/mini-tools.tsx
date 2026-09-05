"use client";

import { useMemo, useRef, useState } from "react";
import { Braces, Check, Copy, Shrink, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JsonErrorPanel } from "@/features/json/components/error-panel";
import { parseJSON, repairJSON, type JsonValue } from "@/features/json/core";
import { copyText } from "@/lib/json/clipboard";

type Variant = "validate" | "minify" | "repair";

const COPY_LABEL: Record<Variant, string> = {
  validate: "复制输入",
  minify: "复制压缩结果",
  repair: "复制修复结果",
};

const SECTION_LABEL: Record<Variant, string> = {
  validate: "JSON 校验",
  minify: "JSON 压缩",
  repair: "JSON 修复",
};

function describeValue(value: JsonValue): string {
  if (Array.isArray(value)) return `数组 · ${value.length} 项`;
  if (value !== null && typeof value === "object") return `对象 · ${Object.keys(value).length} 个键`;
  if (typeof value === "string") return "字符串";
  if (typeof value === "number") return "数字";
  if (typeof value === "boolean") return "布尔值";
  return "null";
}

/**
 * Lightweight client tool used by the dedicated /validator, /minify and
 * /repair pages. Plain textareas keep these pages fast and testable; all
 * processing happens in the browser.
 */
export function MiniJsonTool({ variant }: { variant: Variant }) {
  const [input, setInput] = useState("");
  const [repaired, setRepaired] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsed = useMemo(() => parseJSON(input), [input]);
  const isEmpty = input.trim().length === 0;
  const showError = !isEmpty && !parsed.ok;

  const minified = parsed.ok ? JSON.stringify(parsed.value) : "";

  function handleRepair() {
    if (parsed.ok) {
      setRepaired(null);
      setNotice("此 JSON 已有效，无需修复。");
      return;
    }
    const result = repairJSON(input);
    if (result.ok) {
      setRepaired(result.repaired);
      setNotice("JSON 修复成功。");
    } else {
      setRepaired(null);
      setNotice(result.error ?? "无法修复此 JSON。");
    }
  }

  function handleCopy(text: string) {
    if (!text) return;
    void copyText(text).then((ok) => {
      if (ok) {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1500);
      } else {
        setNotice("复制失败，请手动选择文本复制。");
      }
    });
  }

  const outputText = variant === "minify" ? minified : variant === "repair" ? (repaired ?? "") : "";

  return (
    <section aria-label={SECTION_LABEL[variant]} className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:flex-1">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        {variant === "minify" && (
          <Button variant="default" size="sm" onClick={() => setNotice(null)} disabled={isEmpty || !parsed.ok}>
            <Shrink aria-hidden="true" />
            压缩
          </Button>
        )}
        {variant === "repair" && (
          <Button variant="default" size="sm" onClick={handleRepair} disabled={isEmpty}>
            <Wrench aria-hidden="true" />
            修复
          </Button>
        )}
        {variant === "validate" && (
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Braces aria-hidden="true" className="size-3.5" />
            实时校验
          </span>
        )}

        {variant !== "validate" && (
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(outputText)}
              disabled={!outputText}
            >
              {copied ? <Check aria-hidden="true" className="text-emerald-500" /> : <Copy aria-hidden="true" />}
              {copied ? "已复制" : COPY_LABEL[variant]}
            </Button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-col md:flex-1 md:flex-row md:divide-x md:divide-border">
        {/* Input */}
        <div className="flex min-h-0 flex-col md:flex-1">
          <div className="shrink-0 border-b border-border px-3 py-1.5">
            <label htmlFor={`${variant}-input`} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              输入
            </label>
          </div>
          <textarea
            id={`${variant}-input`}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setNotice(null);
              setRepaired(null);
            }}
            placeholder={`在此粘贴你的 JSON…`}
            spellCheck={false}
            className="json-mono h-96 w-full resize-none bg-transparent p-4 text-[13px] leading-[1.6] text-foreground placeholder:text-muted-foreground focus-visible:outline-none md:h-auto md:min-h-0 md:flex-1"
          />
        </div>

        {/* Output */}
        <div className="flex min-h-0 flex-col md:flex-1">
          <div className="shrink-0 border-b border-border px-3 py-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">结果</span>
          </div>
          <div className="h-96 bg-background md:h-auto md:min-h-0 md:flex-1" role="status" aria-live="polite">
            {isEmpty ? (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="text-sm text-muted-foreground">请粘贴 JSON 以查看结果。</p>
              </div>
            ) : variant === "repair" ? (
              repaired !== null ? (
                <textarea
                  readOnly
                  value={repaired}
                  aria-label="复制修复结果"
                  className="json-mono h-full w-full resize-none bg-transparent p-4 text-[13px] leading-[1.6] text-foreground focus-visible:outline-none"
                />
              ) : parsed.ok ? (
                <div className="flex h-full flex-col items-start gap-2 overflow-auto p-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white" aria-hidden="true">
                      ✓
                    </span>
                    此 JSON 已有效
                  </span>
                  <p className="text-sm text-muted-foreground">
                    无需修复，如需确认可点击修复按钮。
                  </p>
                </div>
              ) : (
                <JsonErrorPanel error={parsed.error} />
              )
            ) : variant === "validate" ? (
              showError ? (
                <JsonErrorPanel error={parsed.error} />
              ) : (
                <div className="flex h-full flex-col items-start gap-2 overflow-auto p-4">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white" aria-hidden="true">
                      ✓
                    </span>
                    有效 JSON
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {parsed.ok && describeValue(parsed.value)} · {input.length.toLocaleString()} 个字符
                  </p>
                </div>
              )
            ) : showError ? (
              <JsonErrorPanel error={parsed.error} />
            ) : (
              <textarea
                readOnly
                value={outputText}
                aria-label={COPY_LABEL[variant]}
                className="json-mono h-full w-full resize-none bg-transparent p-4 text-[13px] leading-[1.6] text-foreground focus-visible:outline-none"
              />
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
        {variant === "repair" && repaired !== null && (
          <span className="text-emerald-600 dark:text-emerald-400">{notice}</span>
        )}
        {variant === "repair" && repaired === null && notice && (
          <span className={parsed.ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
            {notice}
          </span>
        )}
        {variant !== "repair" && notice && <span>{notice}</span>}
        {variant === "minify" && parsed.ok && !isEmpty && !notice && (
          <span>已移除 {Math.max(0, input.length - minified.length).toLocaleString()} 个空白字符。</span>
        )}
        {variant === "validate" && parsed.ok && !isEmpty && !notice && (
          <span>校验已在浏览器本地完成，未上传任何内容。</span>
        )}
        {variant === "repair" && parsed.ok && repaired === null && !notice && (
          <span>在浏览器本地运行。</span>
        )}
      </div>
    </section>
  );
}
