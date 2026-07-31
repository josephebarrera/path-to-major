"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`lp-nav-wrap ${scrolled ? "lp-nav-scrolled" : ""}`}>
      <div className="lp-nav-inner">
        <div className="lp-nav-spacer" />
        <div className="lp-nav-brand">
          <span className="lp-nav-mark" aria-hidden="true">
            <Compass className="h-[16px] w-[16px]" strokeWidth={2} />
          </span>
          PathToMajor
        </div>
        <div className="lp-nav-right">
          <Link href="/auth" className="lp-nav-signin">
            Sign in
          </Link>
          <span className="lp-nav-divider" aria-hidden="true" />
          <Link href="/auth?mode=signup" className="lp-nav-cta">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
