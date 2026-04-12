"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service when available
    console.error("[Trayati] Unhandled error:", error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, backgroundColor: "#F5F1E8", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "480px" }}>
            <div
              style={{
                display: "inline-block",
                borderRadius: "9999px",
                padding: "0.375rem 1rem",
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.3em",
                backgroundColor: "rgba(199,91,26,0.1)",
                color: "#C75B1A",
                marginBottom: "1.5rem",
              }}
            >
              Something went wrong
            </div>

            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#203C4C",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
                lineHeight: 1.1,
              }}
            >
              Oops — unexpected detour
            </h1>

            <p style={{ color: "#4B5563", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Something went wrong on our end. Our team has been notified.
              Please try again or head back home.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={reset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "9999px",
                  padding: "1rem 2rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "white",
                  backgroundColor: "#C75B1A",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 12px 30px rgba(199,91,26,0.35)",
                }}
              >
                Try Again
              </button>
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "9999px",
                  padding: "1rem 2rem",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#203C4C",
                  border: "1px solid rgba(32,60,76,0.15)",
                  backgroundColor: "rgba(245,241,232,0.9)",
                  textDecoration: "none",
                }}
              >
                ← Back Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
