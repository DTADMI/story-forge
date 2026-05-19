"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle dark mode"
        className="border-fg/20 hover:bg-fg/5 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className="border-fg/20 hover:bg-fg/5 inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <span aria-hidden className="text-base leading-none">🌙</span>
          <span>Dark</span>
        </>
      ) : (
        <>
          <span aria-hidden className="text-base leading-none">☀️</span>
          <span>Light</span>
        </>
      )}
    </button>
  );
}
