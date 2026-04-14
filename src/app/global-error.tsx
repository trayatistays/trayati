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
    console.error("[Trayati] Unhandled error:", error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, backgroundColor: "#F5F1E9", fontFamily: "system-ui, sans-serif" }}>
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
                backgroundColor: "rgba(164,108,43,0.1)",
                color: "#A46C2B",
                marginBottom: "1.5rem",
              }}
            >
              Something went wrong
            </div>

            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                color: "#4A6544",
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
                lineHeight: 1.1,
              }}
            >
              Oops — unexpected detour
            </h1>

            <p style={{ color: "#5C5C5C", marginBottom: "2.5rem", lineHeight: 1.6 }}>
              Something went wrong on our end. Our team has been notified.
              Please try again or head back home.
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = "#3E553A";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = "#4A6544";
                }}
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
                  backgroundColor: "#4A6544",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 12px 30px rgba(74,101,68,0.35)",
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
                  color: "#4A6544",
                  border: "1px solid rgba(74,101,68,0.15)",
                  backgroundColor: "rgba(245,241,233,0.9)",
                  textDecoration: "none",
                }}
              >
                &larr; Back Home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
