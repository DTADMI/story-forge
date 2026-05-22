import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRouter = { push: vi.fn(), refresh: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: vi.fn(),
}));

import { createBrowserClient } from "@/lib/supabase/client";

function getInputs(container: HTMLElement) {
  const emailInput = container.querySelector<HTMLInputElement>('input[type="email"]');
  const passwordInput = container.querySelector<HTMLInputElement>('input[type="password"]');
  if (!emailInput || !passwordInput) throw new Error("Could not find inputs");
  return { emailInput, passwordInput };
}

describe("SignInPage", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    user = userEvent.setup();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders sign-in form", async () => {
    const { default: SignInPage } = await import("@/app/(auth)/signin/page");
    render(<SignInPage />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it("calls signInWithPassword on form submit", async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: { signInWithPassword: mockSignIn, signInWithOAuth: vi.fn() },
    });

    const { default: SignInPage } = await import("@/app/(auth)/signin/page");
    const { container } = render(<SignInPage />);
    const { emailInput, passwordInput } = getInputs(container);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("shows error message on failed sign-in", async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: new Error("Invalid credentials") });
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: { signInWithPassword: mockSignIn, signInWithOAuth: vi.fn() },
    });

    const { default: SignInPage } = await import("@/app/(auth)/signin/page");
    const { container } = render(<SignInPage />);
    const { emailInput, passwordInput } = getInputs(container);

    await user.type(emailInput, "fail@test.com");
    await user.type(passwordInput, "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
