import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/lib/flags", () => ({
  isEnabledSync: vi.fn(),
}));

import { isEnabledSync } from "@/lib/flags";
import { AiPlotPanel } from "@/components/ai/ai-plot";
import { createQueryClient } from "@/lib/query-client";

function renderWithQuery(ui: React.ReactElement) {
  return render(<QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>);
}

describe("AiPlotPanel", () => {
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

    const { container } = renderWithQuery(<AiPlotPanel context="A story plot" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders button when feature flag is enabled", () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    renderWithQuery(<AiPlotPanel context="A story plot" />);
    expect(screen.getByText(/analyze story structure/i)).toBeInTheDocument();
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
                json: () => Promise.resolve({}),
              }),
            100
          )
        )
    );

    renderWithQuery(<AiPlotPanel context="A story plot" />);
    const button = screen.getByText(/analyze story structure/i);
    await user.click(button);

    expect(screen.getByText(/analyzing plot/i)).toBeInTheDocument();
  });

  it("displays analysis tabs on success", async () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          analysis: {
            overview: "Strong opening.",
            structure: "Three-act structure.",
            pacing: "Good pacing.",
            conflict: "Clear conflict.",
            characters: "Well-developed.",
            resolution: "Satisfying.",
          },
          strengths: ["Strong hook"],
          weaknesses: ["Slow middle"],
          recommendations: [{ area: "Pacing", suggestion: "Add twist." }],
          score: 7.5,
        }),
    });

    renderWithQuery(<AiPlotPanel context="A story plot" />);
    const button = screen.getByText(/analyze story structure/i);
    await user.click(button);

    expect(await screen.findByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Strengths")).toBeInTheDocument();
    expect(screen.getByText("Weaknesses")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
    expect(screen.getByText("7.5/10")).toBeInTheDocument();
  });
});
