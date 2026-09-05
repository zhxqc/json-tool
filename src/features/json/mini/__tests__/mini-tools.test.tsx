import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MiniJsonTool } from "../mini-tools";

function inputFor() {
  return screen.getByLabelText("输入", { selector: "textarea" }) as HTMLTextAreaElement;
}

describe("MiniJsonTool — validate", () => {
  it("confirms valid JSON", () => {
    render(<MiniJsonTool variant="validate" />);
    fireEvent.change(inputFor(), { target: { value: '{"ok": true}' } });
    expect(screen.getByText(/有效 JSON/)).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("reports detailed errors for invalid JSON", () => {
    render(<MiniJsonTool variant="validate" />);
    fireEvent.change(inputFor(), { target: { value: '{"a": 1,}' } });
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText(/无效 JSON/)).toBeInTheDocument();
  });
});

describe("MiniJsonTool — minify", () => {
  it("produces minified output for valid JSON", () => {
    render(<MiniJsonTool variant="minify" />);
    fireEvent.change(inputFor(), {
      target: { value: '{\n  "a": 1,\n  "b": 2\n}' },
    });
    const output = screen.getByLabelText("复制压缩结果") as HTMLTextAreaElement;
    expect(output.value).toBe('{"a":1,"b":2}');
  });

  it("shows an error for invalid JSON", () => {
    render(<MiniJsonTool variant="minify" />);
    fireEvent.change(inputFor(), { target: { value: "{a: 1}" } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("MiniJsonTool — repair", () => {
  it("repairs broken JSON and shows the result", async () => {
    const user = userEvent.setup();
    render(<MiniJsonTool variant="repair" />);
    fireEvent.change(inputFor(), { target: { value: "{a: 1,}" } });

    await user.click(screen.getByRole("button", { name: "修复" }));
    const output = screen.getByLabelText("复制修复结果") as HTMLTextAreaElement;
    expect(JSON.parse(output.value)).toEqual({ a: 1 });
    expect(screen.getByText(/修复成功/)).toBeInTheDocument();
  });

  it("tells the user when the JSON is already valid", async () => {
    const user = userEvent.setup();
    render(<MiniJsonTool variant="repair" />);
    fireEvent.change(inputFor(), { target: { value: '{"a": 1}' } });

    await user.click(screen.getByRole("button", { name: "修复" }));
    expect(screen.getAllByText(/已有效/).length).toBeGreaterThan(0);
  });
});
