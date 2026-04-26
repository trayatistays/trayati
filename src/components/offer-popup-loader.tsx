"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const POPUP_STORAGE_KEY = "trayati_offer_popup_shown";
const POPUP_DELAY_MS = 10_000;

const OfferPopup = dynamic(
  () => import("@/components/offer-popup").then((m) => ({ default: m.OfferPopup })),
  { ssr: false },
);

export function OfferPopupLoader() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(POPUP_STORAGE_KEY)) return;
    } catch {}

    const timer = window.setTimeout(() => setShouldLoad(true), POPUP_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return shouldLoad ? <OfferPopup openImmediately /> : null;
}
