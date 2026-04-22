"use client";

import dynamic from "next/dynamic";

// ssr:false is only valid in Client Components
const OfferPopup = dynamic(
  () => import("@/components/offer-popup").then((m) => ({ default: m.OfferPopup })),
  { ssr: false },
);

export function OfferPopupLoader() {
  return <OfferPopup />;
}
