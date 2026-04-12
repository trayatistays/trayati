"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";

const HIDDEN_FOOTER_PREFIXES = ["/admin"];

export function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_FOOTER_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className={hideChrome ? "min-h-screen" : "public-site-shell min-h-screen"}>
      {hideChrome ? (
        children
      ) : (
        <>
          <div className="public-site-shell__bg" aria-hidden="true" />
          <div className="relative z-10">
            {children}
            <SiteFooter />
          </div>
        </>
      )}
    </div>
  );
}
