import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/flags", () => ({
  isEnabledSync: vi.fn(),
}));

import { isEnabledSync } from "@/lib/flags";
import { AiResearchPanel } from "@/components/ai/ai-research";
import { createQueryClient } from "@/lib/query-client";

function renderWithQuery(ui: React.ReactElement) {
  return render(<QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>);
}

describe("AiResearchPanel", () => {
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

    const { container } = renderWithQuery(<AiResearchPanel />);
    expect(container.firstChild).toBeNull();
  });

  it("renders search input when feature flag is enabled", () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    renderWithQuery(<AiResearchPanel />);
    expect(screen.getByPlaceholderText(/ask about historical facts/i)).toBeInTheDocument();
    expect(screen.getByText("Research")).toBeInTheDocument();
  });

  it("displays findings on successful search", async () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          findings: [
            {
              topic: "Blacksmithing",
              summary: "Medieval blacksmiths used charcoal forges.",
              details: "Forges reached high temperatures.",
              reliability: "high",
              sources: ["Medieval Technology (White, 1962)"],
            },
          ],
          accuracyNotes: "Verify with primary sources.",
          writingTips: ["Describe the heat shimmer."],
          furtherReading: ["Pattern welding"],
        }),
    });

    renderWithQuery(<AiResearchPanel />);
    const input = screen.getByPlaceholderText(/ask about historical facts/i);
    await user.type(input, "medieval blacksmithing");
    const button = screen.getByText("Research");
    await user.click(button);

    expect(await screen.findByText("Blacksmithing")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
    expect(screen.getByText("Medieval blacksmiths used charcoal forges.")).toBeInTheDocument();
    expect(screen.getByText("Writing Tips")).toBeInTheDocument();
    expect(screen.getByText("Further Reading")).toBeInTheDocument();
  });

  it("does not search with empty query", async () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    renderWithQuery(<AiResearchPanel />);
    const button = screen.getByText("Research");
    expect(button).toBeDisabled();
  });
});
