"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Reveals a section the first time it scrolls into view — CLAUDE.md §7.
 *
 * The brand guide allows one orchestrated entrance per screen, triggered either
 * by an Intersection Observer or by a plain animation-delay. A landing page is
 * taller than a screen, so the sections below the fold use the observer and the
 * hero, which is already on screen at load, uses the delay.
 *
 * It disconnects after the first intersection: this is an entrance, not a
 * scroll effect. A section that fades out again when it leaves the viewport is
 * the kind of motion the guide rules out.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Offset inside a group of siblings, so they cascade instead of popping together. */
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Anything already on screen at mount is revealed without waiting, and a
    // browser without the observer gets the content rather than a blank block.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      // Fires a little before the section reaches the bottom edge, so the
      // entrance is finishing as the reader arrives rather than starting then.
      { rootMargin: "0px 0px -12% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      className={cn(shown && "panel-in", className)}
      style={{ "--stagger": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
