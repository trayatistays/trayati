"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "trayati_pending_reservation";

function ReservationRecoveryInner({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw) as { stayId: string };
      const returnTo = `/property/${pending.stayId}`;
      if (pathname !== returnTo) {
        window.location.replace(returnTo);
      }
    } catch {}
  }, [isSignedIn, isLoaded, pathname]);

  return <>{children}</>;
}

function ReservationRecovery({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ReservationRecoveryInner>{children}</ReservationRecoveryInner>
    </Suspense>
  );
}

export function ClerkShell({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <ReservationRecovery>{children}</ReservationRecovery>
    </ClerkProvider>
  );
}
