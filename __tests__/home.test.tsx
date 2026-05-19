import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders marketing headline and links", async () => {
    const ui = await HomePage();
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /storyforge/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("link", { name: /pricing/i })).toHaveAttribute("href", "/pricing");
    const publicFeedLinks = screen.getAllByRole("link", { name: /public feed/i });
    expect(publicFeedLinks.length).toBeGreaterThan(0);
    for (const link of publicFeedLinks) {
      expect(link).toHaveAttribute("href", "/feed");
    }
  });
});
