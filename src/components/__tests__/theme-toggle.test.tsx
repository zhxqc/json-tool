import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@/components/theme-toggle";

const themeState = vi.hoisted(() => ({
  resolvedTheme: "dark",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: themeState.resolvedTheme,
    setTheme: themeState.setTheme,
  }),
}));

describe("ThemeToggle", () => {
  it("switches to light mode when the site is in dark mode", () => {
    themeState.resolvedTheme = "dark";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /切换到浅色模式/ }));
    expect(themeState.setTheme).toHaveBeenCalledWith("light");
  });

  it("switches to dark mode when the site is in light mode", () => {
    themeState.resolvedTheme = "light";
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: /切换到深色模式/ }));
    expect(themeState.setTheme).toHaveBeenCalledWith("dark");
  });
});
