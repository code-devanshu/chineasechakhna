"use client";

import { useEffect, useState } from "react";
import { cafe } from "@/lib/content";

const links = [
  ...cafe.stages.map((s) => ({ href: `#${s.id}`, label: s.nav })),
  { href: `#${cafe.highlights.id}`, label: cafe.highlights.nav },
  { href: `#${cafe.visit.id}`, label: cafe.visit.nav },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > 760 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <>
    <header className={`nav${scrolled ? " scrolled" : ""}${open ? " menu-open" : ""}`}>
      <a className="logo" href="#top" onClick={close} aria-label={`${cafe.name}, back to top`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mark" src="/brand/mark.png" alt="" aria-hidden="true" />
        {cafe.name}
      </a>
      <nav aria-label="Main">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="btn primary nav-cta" href="#order">
        Order
      </a>
      <button
        type="button"
        className={`burger${open ? " open" : ""}`}
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
    <div id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`} aria-hidden={!open}>
      <nav aria-label="Mobile">
        {links.map((l, i) => (
          <a key={l.href} href={l.href} onClick={close} tabIndex={open ? 0 : -1} style={{ transitionDelay: `${0.12 + i * 0.05}s` }}>
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="mobile-cta" style={{ transitionDelay: `${0.12 + links.length * 0.05}s` }}>
        <a className="btn primary" href="#order" onClick={close} tabIndex={open ? 0 : -1}>
          Order
        </a>
        <a className="mobile-phone" href={cafe.phoneHref} tabIndex={open ? 0 : -1}>
          {cafe.phone}
        </a>
      </div>
    </div>
    </>
  );
}
