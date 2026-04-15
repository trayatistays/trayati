"use client";

import { SignInButton, useUser, useAuth } from "@clerk/nextjs";
import { useState, useEffect, useRef, useCallback } from "react";

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
}: ReserveNowButtonProps) {
  const { isSignedIn } = useUser();
  const { isLoaded } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingReserve, setPendingReserve] = useState(false);
  const hasRedirected = useRef(false);

  const reserve = useCallback(async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stayId,
          roomId: roomId ?? undefined,
          checkIn: checkIn || new Date().toISOString().slice(0, 10),
          checkOut:
            checkOut ||
            new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10),
          guests,
        }),
      });

      const data = (await response.json()) as { error?: string; bookingLink?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to reserve this stay.");
      }

      setMessage("Reservation created! Redirecting to booking...");

      const redirectUrl = data.bookingLink || bookingLink;
      if (redirectUrl) {
        setTimeout(() => {
          window.open(redirectUrl, "_blank", "noopener,noreferrer");
        }, 800);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reserve this stay.");
    } finally {
      setIsSubmitting(false);
    }
  }, [stayId, roomId, checkIn, checkOut, guests, bookingLink]);

  useEffect(() => {
    if (isSignedIn && pendingReserve && !hasRedirected.current) {
      hasRedirected.current = true;
      setPendingReserve(false);
      reserve();
    }
  }, [isSignedIn, pendingReserve, reserve]);

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
          onClick={() => setPendingReserve(true)}
        >
          Reserve Now
        </button>
      </SignInButton>
    );
  }

  return (
    <div>
      <button
        className={className}
        disabled={isSubmitting}
        onClick={reserve}
        style={style}
        type="button"
      >
        {isSubmitting ? "Reserving..." : "Reserve Now"}
      </button>
      {message && (
        <p className="mt-3 text-center text-xs" style={{ color: "var(--muted)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
