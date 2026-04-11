"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";

type ReserveNowButtonProps = {
  stayId: string;
  roomId?: string | null;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function ReserveNowButton({
  stayId,
  roomId,
  checkIn,
  checkOut,
  guests = 1,
  className,
  style,
}: ReserveNowButtonProps) {
  const { isSignedIn } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function reserve() {
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

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to reserve this stay.");
      }

      setMessage("Reservation request received. We will confirm availability soon.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to reserve this stay.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      {!isSignedIn && (
        <SignInButton mode="modal">
          <button className={className} style={style} type="button">
            Reserve Now
          </button>
        </SignInButton>
      )}
      {isSignedIn && (
        <button
          className={className}
          disabled={isSubmitting}
          onClick={reserve}
          style={style}
          type="button"
        >
          {isSubmitting ? "Requesting..." : "Reserve Now"}
        </button>
      )}
      {message && (
        <p className="mt-3 text-center text-xs" style={{ color: "var(--muted)" }}>
          {message}
        </p>
      )}
    </div>
  );
}
