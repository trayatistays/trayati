"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

type ReserveNowButtonProps = {
  stayId: string;
  stayTitle?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function ReserveNowButton({
  stayId,
  stayTitle,
  className,
  style,
}: ReserveNowButtonProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBookNow = () => {
    setIsNavigating(true);

    if (!isSignedIn) {
      // Store the intended destination and redirect to sign in
      localStorage.setItem(
        "booking_redirect",
        `/booking-details/${stayId}`
      );
      router.push("/sign-in");
      return;
    }

    // Navigate directly to booking flow for authenticated users
    router.push(`/booking-details/${stayId}`);
  };

  if (!isLoaded) {
    return (
      <button className={className} style={style} type="button" disabled>
        Loading...
      </button>
    );
  }

  return (
    <button
      className={className}
      style={style}
      type="button"
      onClick={handleBookNow}
      disabled={isNavigating}
    >
      {isNavigating ? "Loading..." : "Book Now"}
    </button>
  );
}
