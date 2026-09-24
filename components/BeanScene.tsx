"use client";

import { useEffect, useRef } from "react";
import type { Keyframe } from "@/lib/roast";

/**
 * The fixed full-screen canvas behind the page. It renders nothing itself: all the work
 * happens in startScene, which reads the page's sections from the DOM after mount.
 *
 * three.js and the scene setup are loaded lazily, once the browser is idle, so the HTML and
 * hydration finish first and the heavy bundle stays out of the initial main-thread work.
 */
export default function BeanScene({ keyframes }: { keyframes: Keyframe[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    const boot = () => {
      import("@/lib/scene").then(({ startScene }) => {
        if (cancelled) return;
        stop = startScene(canvas, keyframes);
        canvas.classList.add("ready");
      });
    };

    const hasIdle = "requestIdleCallback" in window;
    const handle = hasIdle ? window.requestIdleCallback(boot, { timeout: 1500 }) : window.setTimeout(boot, 200);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      stop?.();
    };
  }, [keyframes]);

  return <canvas ref={canvasRef} id="scene" aria-hidden="true" />;
}
