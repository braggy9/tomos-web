"use client";

import { useState, useEffect } from "react";
import { useCurrentWeekType } from "../hooks/useParenting";
import { COLORS } from "./ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function getSydneyNow(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
}

export function Header() {
  const [now, setNow] = useState(getSydneyNow);
  const weekType = useCurrentWeekType();

  useEffect(() => {
    const t = setInterval(() => setNow(getSydneyNow()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting =
    now.getHours() < 12
      ? "Morning"
      : now.getHours() < 17
        ? "Afternoon"
        : "Evening";

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 10,
            color: COLORS.textDim,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}
        >
          TomOS · Command Tower
        </span>
        {weekType && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: 4,
              backgroundColor:
                weekType === "kids" ? `${COLORS.kids}20` : `${COLORS.active}20`,
              color: weekType === "kids" ? COLORS.kids : COLORS.active,
              border: `1px solid ${weekType === "kids" ? COLORS.kids : COLORS.active}40`,
            }}
          >
            {weekType === "kids" ? "👶 Kids Week" : "🏃 Solo Week"}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: COLORS.text,
          letterSpacing: "-0.02em",
        }}
      >
        {greeting}, Tom
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 12,
          color: COLORS.textMuted,
          marginTop: 2,
        }}
      >
        {DAYS[now.getDay()]} {now.getDate()} {MONTHS[now.getMonth()]} ·{" "}
        {now.getHours().toString().padStart(2, "0")}:
        {now.getMinutes().toString().padStart(2, "0")}
      </div>
    </div>
  );
}
