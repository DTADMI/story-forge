import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(public)/page";

describe("HomePage", () => {
  it("renders the page", async () => {
    const ui = await HomePage();
    render(ui);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
