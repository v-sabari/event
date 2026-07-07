import React, { useEffect, useRef, useState } from "react";

/**
 * Purely cosmetic - a small glow that trails the real cursor and grows when
 * hovering anything clickable, to make the app feel a bit more alive.
 * Deliberately does NOT replace the OS cursor (that would hurt usability),
 * it just adds a soft accent layered on top of it.
 *
 * Turned off entirely for touch devices (no mouse to track) and for anyone
 * with prefers-reduced-motion set, since a screen-following animated element
 * is exactly the kind of motion that setting asks apps to avoid.
 */
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || prefersReducedMotion) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    let ringX = 0, ringY = 0;
    let targetX = 0, targetY = 0;
    let rafId;

    const handleMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${targetX}px, ${targetY}px)`;
      }
    };

    // The ring lags slightly behind the dot for a soft trailing feel,
    // instead of both moving in perfect lockstep (which reads as static).
    const animateRing = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      rafId = requestAnimationFrame(animateRing);
    };

    const handleOver = (e) => {
      const interactive = e.target.closest("button, a, input, select, textarea, li, .event-container, .stat-card");
      if (ringRef.current) {
        ringRef.current.classList.toggle("cursor-ring-hover", !!interactive);
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseover", handleOver);
    rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseover", handleOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true"></div>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true"></div>
    </>
  );
}

export default CustomCursor;
