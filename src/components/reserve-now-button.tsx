"use client";

import { SignInButton, useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from "react";

type PendingReservation = {
  stayId: string;
  bookingLink?: string;
  roomId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

const STORAGE_KEY = "trayati_pending_reservation";

function savePending(data: PendingReservation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadPending(): PendingReservation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingReservation) : null;
  } catch {
    return null;
  }
}

function clearPending() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

type ReserveNowButtonProps = {
  stayId: string;
  stayTitle?: string;
  bookingLink?: string;
  roomId?: string | null;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  className?: string;
  style?: React.CSSProperties;
  text?: string;
};

export function ReserveNowButton({
  stayId,
  bookingLink,
  roomId,
  checkIn,
  checkOut,
  guests = 1,
  className,
  style,
  text = "Reserve Now",
}: ReserveNowButtonProps) {
  const { isSignedIn } = useUser();
  const { isLoaded } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reserve = useCallback(
    async (overrideData?: PendingReservation) => {
      setIsSubmitting(true);
      setMessage(null);

      const sid = overrideData?.stayId ?? stayId;
      const bl = overrideData?.bookingLink ?? bookingLink;
      const rid = overrideData?.roomId ?? (roomId ?? undefined);
      const ci = overrideData?.checkIn ?? checkIn;
      const co = overrideData?.checkOut ?? checkOut;
      const g = overrideData?.guests ?? guests;

      try {
        const response = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stayId: sid,
            roomId: rid,
            checkIn: ci || new Date().toISOString().slice(0, 10),
            checkOut:
              co ||
              new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10),
            guests: g,
          }),
        });

        const data = (await response.json()) as {
          error?: string;
          bookingLink?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to reserve this stay.");
        }

        clearPending();
        setMessage("Reservation created! Redirecting to booking...");

        const redirectUrl = data.bookingLink || bl;
        if (redirectUrl) {
          setTimeout(() => {
            window.open(redirectUrl, "_blank", "noopener,noreferrer");
          }, 800);
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to reserve this stay."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [stayId, bookingLink, roomId, checkIn, checkOut, guests]
  );

  useEffect(() => {
    if (!isSignedIn) return;
    const pending = loadPending();
    if (!pending) return;
    reserve(pending);
  }, [isSignedIn, reserve]);

  if (!isLoaded) {
    return (
      <button className={className} style={style} type="button" disabled>
        Loading...
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          className={className}
          style={style}
          type="button"
          onClick={() => {
            savePending({ stayId, bookingLink, roomId: roomId ?? undefined, checkIn, checkOut, guests });
          }}
        >
          {text}
        </button>
      </SignInButton>
    );
  }

  return (
    <div>
      <button
        className={className}
        disabled={isSubmitting}
        onClick={() => reserve()}
        style={style}
        type="button"
      >
        {isSubmitting ? "Reserving..." : text}
      </button>
      {message && (
        <p
          className="mt-3 text-center text-xs"
          style={{ color: "var(--muted)" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
