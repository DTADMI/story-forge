import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/lib/flags", () => ({
  isEnabledSync: vi.fn(),
}));

import { isEnabledSync } from "@/lib/flags";
import { AiStylePanel } from "@/components/ai/ai-style";

describe("AiStylePanel", () => {
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

    const { container } = render(<AiStylePanel context="A text passage" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders button when feature flag is enabled", () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    render(<AiStylePanel context="A text passage" />);
    expect(screen.getByText(/check style consistency/i)).toBeInTheDocument();
  });

  it("displays style profile on success", async () => {
    (isEnabledSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          analysis: {
            voice: "Distinctive voice.",
            tone: "Dark tone.",
            readability: "Good.",
            sentenceVariety: "Varied.",
            wordChoice: "Rich.",
            consistency: "Consistent.",
          },
          strengths: ["Strong voice"],
          improvements: ["Vary openings"],
          suggestions: [
            {
              text: "He walked slowly.",
              issue: "Weak verb",
              rewrite: "He crept.",
            },
          ],
          styleProfile: { formality: "balanced", density: "moderate", emotion: "emotional" },
        }),
    });

    render(<AiStylePanel context="A dark fantasy passage." />);
    const button = screen.getByText(/check style consistency/i);
    await user.click(button);

    expect(await screen.findByText("Analysis")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });
});
