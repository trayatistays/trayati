"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type AssignResult =
  | { code: string; discount: number; assignedAt: string; alreadyAssigned?: boolean }
  | { code: null; message: string; noPool: true }
  | { error: string }
  | null;

export function PostLoginClient() {
  const router = useRouter();
  const [result, setResult] = useState<AssignResult>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    fetch("/api/assign-coupon", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        console.log("[post-login] assign-coupon response:", data);
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[post-login] assign-coupon fetch failed:", err);
        setResult({ error: "Network error" });
        setLoading(false);
      });
  }, []);

  function handleContinue() {
    const pending =
      typeof window !== "undefined"
        ? localStorage.getItem("trayati_pending_reservation")
        : null;
    if (pending) {
      try {
        const { stayId } = JSON.parse(pending);
        localStorage.removeItem("trayati_pending_reservation");
        router.push(`/property/${stayId}`);
        return;
      } catch {}
    }
    router.push("/booking");
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  // Determine what to show
  const hasCode =
    !loading &&
    result !== null &&
    "code" in result &&
    result.code !== null &&
    typeof result.code === "string" &&
    !("alreadyAssigned" in result && result.alreadyAssigned === true);

  const hasAlreadyAssigned =
    !loading &&
    result !== null &&
    "alreadyAssigned" in result &&
    result.alreadyAssigned === true;

  const hasNoPool =
    !loading && result !== null && "noPool" in result;

  const hasError =
    !loading &&
    result !== null &&
    ("error" in result || (!hasCode && !hasAlreadyAssigned && !hasNoPool));

  const card = (children: React.ReactNode) => (
    <div
      className="relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center"
      style={{
        backgroundColor: "rgba(245,241,233,0.97)",
        boxShadow: "0 32px 80px rgba(74,101,68,0.18), 0 0 0 1px rgba(74,101,68,0.10)",
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, rgba(74,101,68,0.10), transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(164,108,43,0.10), transparent 50%), #F5F1E9",
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── Loading shimmer ── */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {card(
              <>
                <div className="mx-auto mb-5 size-16 animate-pulse rounded-2xl" style={{ backgroundColor: "rgba(74,101,68,0.12)" }} />
                <div className="mx-auto mb-3 h-6 w-48 animate-pulse rounded-xl" style={{ backgroundColor: "rgba(74,101,68,0.10)" }} />
                <div className="mx-auto h-4 w-36 animate-pulse rounded-lg" style={{ backgroundColor: "rgba(74,101,68,0.08)" }} />
                <p className="mt-6 text-sm font-medium" style={{ color: "var(--muted)" }}>
                  Preparing your exclusive offer…
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* ── Coupon reveal ── */}
        {hasCode && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl p-8 text-center"
            style={{
              backgroundColor: "rgba(245,241,233,0.97)",
              boxShadow: "0 32px 80px rgba(74,101,68,0.18), 0 0 0 1px rgba(74,101,68,0.10)",
            }}
          >
            {/* Decorative orbs */}
            <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(164,108,43,0.14), transparent 70%)" }} />
            <div className="pointer-events-none absolute -bottom-10 -left-10 size-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(74,101,68,0.12), transparent 70%)" }} />

            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
              className="relative mb-4 text-5xl"
            >
              🎉
            </motion.div>

            <h1 className="relative mb-1 font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
              Your coupon is ready!
            </h1>
            <p className="relative mb-6 text-sm" style={{ color: "var(--foreground-soft)" }}>
              {(result as { discount: number }).discount}% off your first booking at Trayati
            </p>

            {/* Coupon code chip */}
            <motion.button
              onClick={() => handleCopy((result as { code: string }).code)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative mx-auto mb-3 flex w-full items-center justify-between rounded-2xl px-5 py-4 transition-all"
              style={{ border: "2px dashed rgba(164,108,43,0.55)", backgroundColor: "rgba(255,255,255,0.8)" }}
              aria-label="Click to copy coupon code"
            >
              <div className="text-left">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--muted)" }}>
                  Coupon Code
                </p>
                <p className="font-mono text-2xl font-bold tracking-widest" style={{ color: "var(--primary)" }}>
                  {(result as { code: string }).code}
                </p>
              </div>
              <div
                className="flex size-10 items-center justify-center rounded-xl text-sm font-bold"
                style={{
                  backgroundColor: copied ? "rgba(74,101,68,0.15)" : "rgba(164,108,43,0.12)",
                  color: copied ? "var(--primary)" : "var(--cta)",
                }}
              >
                {copied ? "✓" : "⧉"}
              </div>
            </motion.button>

            <p className="relative mb-5 text-xs" style={{ color: "var(--muted)" }}>
              {copied ? "Copied!" : "Tap to copy"} · Also sent to your email ✉️
            </p>

            <div
              className="relative mb-5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold"
              style={{ backgroundColor: "rgba(74,101,68,0.08)", color: "var(--primary)" }}
            >
              <span>✔</span>
              <span>Confirmation sent to your email</span>
            </div>

            <button
              onClick={handleContinue}
              className="relative w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4A6544, #3E553A)",
                boxShadow: "0 8px 24px rgba(74,101,68,0.30)",
              }}
            >
              Explore Stays &amp; Use Coupon →
            </button>
          </motion.div>
        )}

        {/* ── Already Claimed ── */}
        {hasAlreadyAssigned && (
          <motion.div
            key="already-claimed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {card(
              <>
                <div className="mb-4 text-5xl">✨</div>
                <h1 className="mb-2 font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
                  Welcome back!
                </h1>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  You have already claimed this offer. We&apos;re glad to see you again!
                </p>
                <button
                  onClick={handleContinue}
                  className="w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #4A6544, #3E553A)" }}
                >
                  Explore Stays →
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── No pool available ── */}
        {hasNoPool && (
          <motion.div
            key="no-pool"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {card(
              <>
                <div className="mb-4 text-5xl">🏡</div>
                <h1 className="mb-2 font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
                  Welcome aboard!
                </h1>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  No offers are available right now — you&apos;re first in line for the next one. Happy exploring!
                </p>
                <button
                  onClick={handleContinue}
                  className="w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #4A6544, #3E553A)" }}
                >
                  Explore Stays →
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── Error / tables not set up yet ── */}
        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {card(
              <>
                <div className="mb-4 text-5xl">🏡</div>
                <h1 className="mb-2 font-display text-2xl font-bold" style={{ color: "var(--primary)" }}>
                  Welcome to Trayati!
                </h1>
                <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--foreground-soft)" }}>
                  Your account is ready. Start exploring our handpicked stays across India.
                </p>
                <button
                  onClick={handleContinue}
                  className="w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #4A6544, #3E553A)" }}
                >
                  Explore Stays &amp; Book Now →
                </button>
              </>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
