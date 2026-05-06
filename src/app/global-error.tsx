"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#071733", color: "#f7f8fa", fontFamily: "system-ui" }}>
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem" }}>Critical error</h1>
          <p style={{ color: "#97a4bf", fontSize: "0.875rem", marginTop: "0.75rem" }}>{error.message}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              background: "#f2b705",
              color: "#071733",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
