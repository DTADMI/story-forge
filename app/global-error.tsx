"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body
        style={{
          background: "#0b0b0f",
          color: "#f4f4f5",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 500, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>StoryForge</h1>
          <p style={{ fontSize: 14, color: "#a1a1aa", margin: "0 0 24px" }}>
            Something went wrong. Our team has been notified.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#3f7cff",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <details style={{ marginTop: 24, textAlign: "left" }}>
            <summary style={{ fontSize: 12, color: "#71717a", cursor: "pointer" }}>
              Technical details
            </summary>
            <pre
              style={{
                fontSize: 11,
                color: "#f87171",
                marginTop: 8,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </pre>
          </details>
        </div>
      </body>
    </html>
  );
}
