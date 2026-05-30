import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/flags-server", () => ({
  isEnabled: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import PublicFeedPage from "@/app/(public)/feed/page";

describe("PublicFeedPage", () => {
  it("renders the public stories feed header", async () => {
    const ui = await PublicFeedPage();
    render(ui);
    expect(screen.getByRole("heading", { name: /public stories feed/i })).toBeInTheDocument();
  });
});
