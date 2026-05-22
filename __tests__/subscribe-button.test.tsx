import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

import { SubscribeButton } from "@/components/billing/SubscribeButton";

describe("SubscribeButton", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders monthly label for monthly plan", () => {
    render(<SubscribeButton plan="monthly" />);
    expect(screen.getByText("Subscribe Monthly")).toBeInTheDocument();
  });

  it("renders yearly label for yearly plan", () => {
    render(<SubscribeButton plan="yearly" />);
    expect(screen.getByText("Subscribe Yearly")).toBeInTheDocument();
  });

  it("renders lifetime label for lifetime plan", () => {
    render(<SubscribeButton plan="lifetime" />);
    expect(screen.getByText("Buy Lifetime")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<SubscribeButton plan="monthly" disabled />);
    expect(screen.getByRole("button", { name: /subscribe monthly/i })).toBeDisabled();
  });

  it("calls checkout API on click and redirects on success", async () => {
    let currentUrl = window.location.href;
    const mockLocation = {
      get href() {
        return currentUrl;
      },
      set href(v: string) {
        currentUrl = v;
      },
    };
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
      writable: true,
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://checkout.stripe.com/session_1" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<SubscribeButton plan="monthly" />);
    await user.click(screen.getByText("Subscribe Monthly"));

    expect(mockFetch).toHaveBeenCalledWith("/api/billing/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "monthly" }),
    });
    await vi.waitFor(() => {
      expect(currentUrl).toBe("https://checkout.stripe.com/session_1");
    });

    vi.unstubAllGlobals();
  });

  it("shows alert when checkout returns error", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: "Invalid plan" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    window.alert = vi.fn();

    render(<SubscribeButton plan="monthly" />);
    await user.click(screen.getByText("Subscribe Monthly"));

    await vi.waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Invalid plan");
    });

    vi.unstubAllGlobals();
  });

  it("shows processing text while loading", async () => {
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(fetchPromise));

    render(<SubscribeButton plan="monthly" />);
    const clickPromise = user.click(screen.getByText("Subscribe Monthly"));

    await waitFor(() => {
      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    resolveFetch!({
      ok: true,
      json: () => Promise.resolve({ url: "https://checkout.stripe.com/session_1" }),
    });
    await clickPromise;
    vi.unstubAllGlobals();
  });

  it("does nothing on click when disabled", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    render(<SubscribeButton plan="monthly" disabled />);
    await user.click(screen.getByRole("button", { name: /subscribe monthly/i }));

    expect(mockFetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
