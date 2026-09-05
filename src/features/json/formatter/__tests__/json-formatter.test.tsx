import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JsonFormatter } from "../json-formatter";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

const copyText = vi.fn<(text: string) => Promise<boolean>>(async () => true);
vi.mock("@/lib/json/clipboard", () => ({
  copyText: (text: string) => copyText(text),
}));

const PRETTY = '{\n  "name": "json",\n  "tags": ["a", "b"]\n}';
const MINIFIED = '{"name":"json","tags":["a","b"]}';

describe("JsonFormatter", () => {
  beforeEach(() => {
    copyText.mockClear();
  });

  function getTextarea() {
    return screen.getByLabelText("输入") as HTMLTextAreaElement;
  }

  it("renders the input textarea and toolbar actions", () => {
    render(<JsonFormatter />);
    expect(getTextarea()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /格式化/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /压缩/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "修复" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制输出" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "清空输入" })).toBeInTheDocument();
  });

  it("shows a helpful placeholder when empty", () => {
    render(<JsonFormatter />);
    expect(screen.getByText(/请粘贴 JSON 开始/)).toBeInTheDocument();
  });

  it("formats pasted JSON automatically with 2-space indentation", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: MINIFIED } });
    await user.click(screen.getByRole("button", { name: "文本" }));

    expect(screen.getByText(/有效 JSON/)).toBeInTheDocument();
    const output = screen.getByLabelText("格式化后的 JSON 输出");
    expect(output.textContent).toContain('{\n  "name": "json",\n  "tags": [\n    "a",\n    "b"\n  ]\n}');
  });

  it("switches indentation to 4 spaces and Tab", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: MINIFIED } });
    await user.click(screen.getByRole("button", { name: "文本" }));

    await user.click(screen.getByRole("button", { name: "4 空格" }));
    const output4 = screen.getByLabelText("格式化后的 JSON 输出");
    expect(output4.textContent).toContain('\n    "name"');

    await user.click(screen.getByRole("button", { name: "Tab" }));
    const outputTab = screen.getByLabelText("格式化后的 JSON 输出");
    expect(outputTab.textContent).toContain('\n\t"name"');
  });

  it("minifies pretty JSON when Minify is pressed", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: PRETTY } });
    await user.click(screen.getByRole("button", { name: "文本" }));

    await user.click(screen.getByRole("button", { name: /压缩/ }));
    const output = screen.getByLabelText("格式化后的 JSON 输出");
    expect(output).toHaveTextContent(MINIFIED);
  });

  it("repairs broken JSON (trailing comma) on Repair", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: '{"name": "json",}' } });

    await user.click(screen.getByRole("button", { name: "修复" }));
    expect(screen.getByText(/已自动修复/)).toBeInTheDocument();
    expect(screen.getByText(/有效 JSON/)).toBeInTheDocument();
    expect(getTextarea().value).not.toContain(",}");
  });

  it("shows a detailed error with line, column and caret for invalid JSON", () => {
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: '{\n  "a": 1,\n  "b": \n}' } });

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(within(alert).getByText(/无效 JSON/)).toBeInTheDocument();
    expect(within(alert).getByText(/第 4 行，第 1 列/)).toBeInTheDocument();
  });

  it("does not offer Format/Minify on invalid input", () => {
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: "{bad}" } });
    expect(screen.getByRole("button", { name: /格式化/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /压缩/ })).toBeDisabled();
  });

  it("copies the formatted output", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: MINIFIED } });

    await user.click(screen.getByRole("button", { name: "复制输出" }));
    expect(copyText).toHaveBeenCalledTimes(1);
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining('"name"'));
  });

  it("clears input and output on Clear", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: MINIFIED } });
    expect(screen.getByText(/有效 JSON/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "清空输入" }));
    expect(getTextarea().value).toBe("");
    expect(screen.getByText(/请粘贴 JSON 开始/)).toBeInTheDocument();
  });

  it("loads a sample when the empty-state link is clicked", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    await user.click(screen.getByRole("button", { name: /加载示例/ }));
    expect(getTextarea().value.length).toBeGreaterThan(0);
    expect(screen.getByText(/有效 JSON/)).toBeInTheDocument();
  });

  it("renders the tree view with expandable/collapsible nodes", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: MINIFIED } });

    await user.click(screen.getByRole("button", { name: "树形" }));

    // Keys of the structure are visible, with explicit toggles on containers.
    expect(screen.getByText('"name":')).toBeInTheDocument();
    expect(screen.getByText('"tags":')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "收起 根节点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: '收起 "tags"' })).toBeInTheDocument();

    // "收起全部" collapses the whole tree, hiding nested keys.
    await user.click(screen.getByRole("button", { name: "收起全部" }));
    expect(screen.queryByText('"name":')).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "展开 根节点" })).toBeInTheDocument();

    // "展开全部" restores every node.
    await user.click(screen.getByRole("button", { name: "展开全部" }));
    expect(screen.getByText('"name":')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: '收起 "tags"' })).toBeInTheDocument();
  });

  it("collapses a single node by clicking its toggle", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    fireEvent.change(getTextarea(), { target: { value: MINIFIED } });

    await user.click(screen.getByRole("button", { name: "树形" }));
    await user.click(screen.getByRole("button", { name: '收起 "tags"' }));

    expect(screen.queryByText('"a"')).not.toBeInTheDocument();
    expect(screen.queryByText('"b"')).not.toBeInTheDocument();
    // The rest of the tree stays visible.
    expect(screen.getByText('"name":')).toBeInTheDocument();
  });

  it("offers one-click repair for JSON5-style input and shows the result", async () => {
    const user = userEvent.setup();
    render(<JsonFormatter />);
    // 裸键 + 单引号字符串：严格无效，但可自动修复。
    fireEvent.change(getTextarea(), {
      target: { value: '{ "a": "123", sss: \'122\', cc: 123 }' },
    });

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText(/无效 JSON/)).toBeInTheDocument();
    expect(within(alert).getByText(/第 1 行，第 15 列/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "一键修复并展示" }));
    expect(screen.getByText(/已自动修复 JSON/)).toBeInTheDocument();
    expect(screen.getByText(/有效 JSON/)).toBeInTheDocument();
    expect(getTextarea().value).toBe('{ "a": "123", "sss": "122", "cc": 123 }');
  });
});
