"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

const POPUP_STORAGE_KEY = "trayati_offer_popup_shown";
const POPUP_DELAY_MS = 10_000;

export function OfferPopup({ openImmediately = false }: { openImmediately?: boolean }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [open, setOpen] = useState(false);
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 640;
  }, []);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) return;
    try {
      if (localStorage.getItem(POPUP_STORAGE_KEY)) return;
    } catch {}

    timerRef.current = setTimeout(() => {
      setOpen(true);
      try { localStorage.setItem(POPUP_STORAGE_KEY, "1"); } catch {}
    }, openImmediately ? 0 : POPUP_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoaded, isSignedIn, openImmediately]);

  const modalVariants = isMobile
    ? {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 32, stiffness: 320 } },
        exit: { y: "100%", opacity: 0, transition: { duration: 0.25 } },
      }
    : {
        hidden: { scale: 0.93, opacity: 0, y: 16 },
        visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring" as const, damping: 28, stiffness: 280 } },
        exit: { scale: 0.95, opacity: 0, y: 8, transition: { duration: 0.2 } },
      };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="offer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[10000]"
            style={{ backgroundColor: "rgba(10,20,14,0.55)", backdropFilter: "blur(4px)" }}
            aria-hidden="true"
          />

          {/* Modal / Bottom Sheet */}
          <motion.div
            key="offer-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Exclusive first-booking offer"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-[10001] ${
              isMobile
                ? "inset-x-0 bottom-0 rounded-t-3xl"
                : "left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl"
            }`}
            style={{
              backgroundColor: "rgba(245,241,233,0.97)",
              boxShadow: "0 32px 80px rgba(10,25,16,0.28), 0 0 0 1px rgba(74,101,68,0.12)",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close offer"
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-xl font-bold transition hover:opacity-60"
              style={{ color: "var(--muted)", backgroundColor: "rgba(74,101,68,0.08)" }}
            >
              ×
            </button>

            <div className={`flex flex-col items-center px-7 ${isMobile ? "pb-8 pt-6" : "py-8"}`}>
              {/* Icon */}
              <div
                className="mb-5 flex size-16 items-center justify-center rounded-2xl text-3xl"
                style={{
                  background: "linear-gradient(135deg, rgba(74,101,68,0.15), rgba(164,108,43,0.22))",
                  border: "1px solid rgba(164,108,43,0.25)",
                }}
              >
                🎁
              </div>

              {/* Headline */}
              <h2
                className="mb-2 text-center font-display text-2xl font-bold leading-tight tracking-tight"
                style={{ color: "var(--primary)" }}
              >
                Get{" "}
                <span style={{ color: "var(--cta)" }}>5–10% OFF</span>
                <br />
                your first booking
              </h2>

              <p className="mb-1 text-center text-sm" style={{ color: "var(--foreground-soft)" }}>
                Sign in with Google and we&apos;ll apply your exclusive discount automatically.
              </p>

              {/* Social proof pill */}
              <div
                className="mb-6 mt-3 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: "rgba(74,101,68,0.08)", color: "var(--primary)" }}
              >
                <span style={{ color: "var(--cta)" }}>⚡</span>
                Takes 2 seconds · No form needed
              </div>

              {/* Clerk SignInButton — handles all redirect logic internally, never hangs */}
              <SignInButton
                mode="redirect"
                forceRedirectUrl="/post-login"
                fallbackRedirectUrl="/post-login"
                signUpForceRedirectUrl="/post-login"
                signUpFallbackRedirectUrl="/post-login"
              >
                <button
                  id="offer-popup-google-btn"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #4A6544, #3E553A)",
                    boxShadow: "0 8px 24px rgba(74,101,68,0.35)",
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </SignInButton>

              <p className="mt-4 text-center text-xs" style={{ color: "var(--muted)" }}>
                Your coupon will appear instantly after login.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}
