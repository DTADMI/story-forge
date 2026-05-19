import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from "next-themes";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

describe("DarkModeToggle", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders a toggle button with aria-label", () => {
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });
    expect(button).toBeInTheDocument();
  });

  it("shows light mode UI when theme is light", async () => {
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /toggle dark mode/i });
      expect(button).toHaveTextContent(/light/i);
    });
  });

  it("shows dark mode UI when theme is dark", async () => {
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);

    await waitFor(() => {
      const button = screen.getByRole("button", { name: /toggle dark mode/i });
      expect(button).toHaveTextContent(/dark/i);
    });
  });

  it("toggles theme on click", async () => {
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("toggles from dark to light on click", async () => {
    (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });

    render(<DarkModeToggle />);
    const button = screen.getByRole("button", { name: /toggle dark mode/i });
    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
