"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const HIDDEN_FOOTER_PREFIXES = ["/admin"];

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isHome = pathname === "/";

  return (
    <div className={`public-site-shell min-h-screen${isHome ? " public-site-shell--home" : ""}`}>
      {!hideChrome && <SiteHeader />}
      
      <div className="public-site-shell__bg" aria-hidden="true" />
      <div className="public-site-shell__veil" aria-hidden="true" />
      <div className="public-site-shell__content">
        {children}
        {!hideChrome && <SiteFooter />}
      </div>
    </div>
  );
}
