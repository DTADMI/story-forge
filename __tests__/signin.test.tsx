import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockT = vi.fn((key: string) => {
  const labels: Record<string, string> = {
    "auth.signInTitle": "Sign In to StoryForge",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot password?",
    "auth.noAccount": "Don't have an account?",
    "auth.signingIn": "Signing in...",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.or": "or",
    "common.signUp": "Sign Up",
  };
  return labels[key] || key;
});

const mockRouter = { push: vi.fn(), refresh: vi.fn() };

vi.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

vi.mock("@/i18n/routing", () => ({
  useRouter: () => mockRouter,
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
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

  it("renders sign-in form with translated text", async () => {
    const mockSupabase = {
      auth: { signInWithPassword: vi.fn(), signInWithOAuth: vi.fn() },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    render(<SignInPage />);

    expect(screen.getByRole("heading")).toHaveTextContent("Sign In to StoryForge");
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  it("has a link to sign up page", async () => {
    const mockSupabase = {
      auth: { signInWithPassword: vi.fn(), signInWithOAuth: vi.fn() },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    render(<SignInPage />);

    const signUpLink = screen.getByText("Sign Up");
    expect(signUpLink.closest("a")).toHaveAttribute("href", "/signup");
  });

  it("calls signInWithPassword on form submit", async () => {
    const mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: vi.fn(),
      },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    const { container } = render(<SignInPage />);
    const { emailInput, passwordInput } = getInputs(container);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: /sign in to storyforge/i }));

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("navigates to dashboard on successful sign-in", async () => {
    const mockSignInWithPassword = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: vi.fn(),
      },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    const { container } = render(<SignInPage />);
    const { emailInput, passwordInput } = getInputs(container);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(screen.getByRole("button", { name: /sign in to storyforge/i }));

    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("shows error message on failed sign-in", async () => {
    const mockSignInWithPassword = vi
      .fn()
      .mockResolvedValue({ error: new Error("Invalid login credentials") });
    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: vi.fn(),
      },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    const { container } = render(<SignInPage />);
    const { emailInput, passwordInput } = getInputs(container);

    await user.type(emailInput, "bad@example.com");
    await user.type(passwordInput, "wrong");
    await user.click(screen.getByRole("button", { name: /sign in to storyforge/i }));

    expect(screen.getByText("Invalid login credentials")).toBeInTheDocument();
  });

  it("calls signInWithOAuth for Google", async () => {
    const mockSignInWithOAuth = vi.fn();
    const mockSupabase = {
      auth: {
        signInWithPassword: vi.fn(),
        signInWithOAuth: mockSignInWithOAuth,
      },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    render(<SignInPage />);

    await user.click(screen.getByText("Continue with Google"));

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: expect.stringContaining("/api/auth/callback") },
    });
  });

  it("shows signing in text while authenticating", async () => {
    let resolveSignIn: (value: any) => void;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });
    const mockSignInWithPassword = vi.fn().mockReturnValue(signInPromise);
    const mockSupabase = {
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: vi.fn(),
      },
    };
    (createBrowserClient as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

    const SignInPage = (await import("@/app/(auth)/signin/page")).default;
    const { container } = render(<SignInPage />);
    const { emailInput, passwordInput } = getInputs(container);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    const clickPromise = user.click(screen.getByRole("button", { name: /sign in to storyforge/i }));

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    resolveSignIn!({ error: null });
    await clickPromise;
  });
});
