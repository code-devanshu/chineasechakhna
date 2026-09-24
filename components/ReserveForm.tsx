"use client";

import { useState } from "react";
import { cafe } from "@/lib/content";

/** Half-hour slots across opening hours, 10:30 AM to 11:00 PM. */
const slots = Array.from({ length: 26 }, (_, i) => {
  const mins = 10 * 60 + 30 + i * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m === 0 ? "00" : "30"} ${h >= 12 ? "PM" : "AM"}`;
}).filter((_, i) => 10 * 60 + 30 + i * 30 <= 23 * 60);

const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Builds a WhatsApp message to the cafe. No backend needed, and the cafe confirms in the chat. */
export default function ReserveForm() {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("8:00 PM");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const when = date
      ? new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
      : "a date to be confirmed";
    const text =
      `Hi ${cafe.name}! I'd like to reserve a table.\n` +
      `Name: ${name.trim()}\nGuests: ${guests}\nDate: ${when}\nTime: ${time}\n` +
      `Please confirm if this works. Sent from your website.`;
    window.open(`https://wa.me/${cafe.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <form className="reserve" id="reserve" onSubmit={onSubmit}>
      <h3>Reserve a table</h3>
      <p className="fine tight">Send a request on WhatsApp and the team will confirm your table.</p>
      <div className="fields">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </label>
        <label>
          Guests
          <select value={guests} onChange={(e) => setGuests(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} min={today()} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label>
          Time
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            {slots.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <button className="btn primary" type="submit">
        Request on WhatsApp
      </button>
    </form>
  );
}
