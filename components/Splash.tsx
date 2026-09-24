"use client";

import { useEffect, useState } from "react";
import { cafe } from "@/lib/content";

const DURATION = 900;
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

/** One odometer column. It holds still, then slides to the next digit as the column below it wraps. */
function Digit({ value, place }: { value: number; place: number }) {
  const scaled = value / 10 ** place;
  const whole = Math.floor(scaled);
  const ramp = Math.min(1, Math.max(0, (scaled - whole - 0.7) / 0.3));
  const pos = (whole % 10) + ramp;
  return (
    <span className="odo-col">
      <span className="odo-strip" style={{ transform: `translateY(${-pos}em)` }}>
        {STRIP.map((d, i) => (
          <span key={i} className="odo-digit">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Full-screen intro. The logo fills in as a counter runs to 100, then the screen slides up. It is in the server HTML, so there is no flash of the site first. */
export default function Splash() {
  const [value, setValue] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("splashing");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduce ? 500 : DURATION;
    const start = performance.now();
    let raf = 0;
    let timer = 0;
    let loaded = document.readyState === "complete";
    let counted = false;

    const leave = () => {
      setLeaving(true);
      timer = window.setTimeout(() => setGone(true), 500);
    };
    const maybeLeave = () => {
      if (counted && loaded) leave();
    };
    const onLoad = () => {
      loaded = true;
      maybeLeave();
    };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / total);
      // ease-in-out so it lingers a touch on the way up
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setValue(eased * 100);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        counted = true;
        maybeLeave();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      document.documentElement.classList.remove("splashing");
    };
  }, []);

  useEffect(() => {
    if (leaving) document.documentElement.classList.remove("splashing");
  }, [leaving]);

  if (gone) return null;
  const pct = Math.round(value);
  return (
    <div className={`splash${leaving ? " leaving" : ""}`} role="status" aria-label={`${cafe.name} is loading ${pct}%`}>
      <div className="splash-embers" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <div className="splash-mark">
        <div className="splash-ring" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <circle className="ring-a" cx="100" cy="100" r="96" />
            <circle className="ring-b" cx="100" cy="100" r="88" />
          </svg>
        </div>
        <div className="splash-steam" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="splash-logo ghost" src="/brand/logo.png" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="splash-logo fill"
          src="/brand/logo.png"
          alt=""
          style={{ clipPath: `inset(${100 - value}% 0 0 0)` }}
        />
      </div>
      <div className="splash-caption" aria-hidden="true">
        <p className="splash-name">
          {cafe.name.split("").map((c, i) => (
            <span key={i} style={{ "--d": `${0.25 + i * 0.045}s` } as React.CSSProperties}>
              {c === " " ? "\u00a0" : c}
            </span>
          ))}
        </p>
        <p className="splash-tag">{cafe.subtitle}</p>
        <div className="splash-bar">
          <span style={{ transform: `scaleX(${value / 100})` }} />
        </div>
      </div>
      <div className="splash-count" aria-hidden="true">
        <span className="odo">
          <Digit value={value} place={2} />
          <Digit value={value} place={1} />
          <Digit value={value} place={0} />
        </span>
        <span className="odo-pct">%</span>
      </div>
    </div>
  );
}
