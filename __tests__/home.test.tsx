import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders marketing headline and links", async () => {
    const ui = await HomePage();
    render(ui);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start writing/i })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: /explore stories/i })).toHaveAttribute("href", "/feed");
  });
});
