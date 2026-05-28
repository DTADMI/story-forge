import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/flags", () => ({
  isEnabledSync: vi.fn(),
}));

import { isEnabledSync } from "@/lib/flags";
import { AiCharacterPanel } from "@/components/ai/ai-character";
import { createQueryClient } from "@/lib/query-client";

function renderWithQuery(ui: React.ReactElement) {
  return render(<QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>);
}

describe("AiCharacterPanel", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders nothing when feature flag is disabled", () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

    const { container } = renderWithQuery(<AiCharacterPanel context="A fantasy novel" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders button when feature flag is enabled", () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    renderWithQuery(<AiCharacterPanel context="A fantasy novel" />);
    expect(screen.getByText(/generate character ideas/i)).toBeInTheDocument();
  });

  it("shows loading state on click", async () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    global.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve({ suggestions: [] }),
              }),
            100
          )
        )
    );

    renderWithQuery(<AiCharacterPanel context="A fantasy novel" />);
    const button = screen.getByText(/generate character ideas/i);
    await user.click(button);

    expect(await screen.findByText(/generating characters/i)).toBeInTheDocument();
  });

  it("shows error message on failure", async () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Character generation failed" }),
    });

    renderWithQuery(<AiCharacterPanel context="A fantasy novel" />);
    const button = screen.getByText(/generate character ideas/i);
    await user.click(button);

    expect(await screen.findByText(/character generation failed/i)).toBeInTheDocument();
  });
});
