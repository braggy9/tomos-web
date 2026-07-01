"use client";

import { useState } from "react";

// ─── Colors (matching JSX design spec exactly) ──────────────

export const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceHover: "#22263a",
  border: "#2a2e3d",
  text: "#e4e4e7",
  textMuted: "#71717a",
  textDim: "#52525b",
  work: "#3b82f6",
  personal: "#a78bfa",
  kids: "#f43f5e",
  tomos: "#8b5cf6",
  mixtape: "#f97316",
  bison: "#14b8a6",
  someday: "#71717a",
  p1: "#ef4444",
  p2: "#f59e0b",
  p3: "#3b82f6",
  p4: "#71717a",
  active: "#22c55e",
  overdue: "#ef4444",
  upcoming: "#3b82f6",
} as const;

export const projectColors: Record<string, string> = {
  Work: COLORS.work,
  Personal: COLORS.personal,
  Kids: COLORS.kids,
  TomOS: COLORS.tomos,
  MixTape: COLORS.mixtape,
  Bison: COLORS.bison,
  Someday: COLORS.someday,
};

export const priorityColors: Record<string, string> = {
  p1: COLORS.p1,
  p2: COLORS.p2,
  p3: COLORS.p3,
  p4: COLORS.p4,
};

export const moodEmoji: Record<string, string> = {
  great: "🔥",
  good: "😊",
  okay: "😐",
  low: "😔",
  rough: "😣",
};

export const moodColors: Record<string, string> = {
  great: "#22c55e",
  good: "#3b82f6",
  okay: "#f59e0b",
  low: "#f97316",
  rough: "#ef4444",
};

// ─── Primitives ─────────────────────────────────────────────

export function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 16,
        border: `1px solid ${COLORS.border}`,
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  color = COLORS.textMuted,
  bg,
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        fontSize: 10,
        fontFamily: "var(--font-display)",
        fontWeight: 500,
        color,
        backgroundColor: bg || `${color}18`,
        padding: "2px 7px",
        borderRadius: 4,
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function SectionHeader({
  icon,
  title,
  count,
  accent,
}: {
  icon: string;
  title: string;
  count?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          fontWeight: 600,
          color: accent || COLORS.text,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {count != null && (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 10,
            color: COLORS.textDim,
            marginLeft: "auto",
          }}
        >
          {count}
        </span>
      )}
    </div>
  );
}

export function PriorityDot({ priority }: { priority: string }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: priorityColors[priority] || COLORS.p4,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export function ProgressBar({
  value,
  max,
  color,
  height = 6,
}: {
  value: number;
  max: number;
  color: string;
  height?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        backgroundColor: `${color}20`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: height / 2,
          backgroundColor: color,
          transition: "width 0.6s ease",
        }}
      />
    </div>
  );
}

export function RecoveryMeter({
  label,
  value,
  max = 5,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const color = value >= 4 ? COLORS.active : value >= 3 ? COLORS.p2 : COLORS.p1;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 10,
          color: COLORS.textMuted,
          width: 52,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1 }}>
        <ProgressBar value={value} max={max} color={color} height={4} />
      </div>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 11,
          color,
          width: 16,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function MoodDot({ mood }: { mood: string | null }) {
  if (!mood) {
    return (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: COLORS.border,
          opacity: 0.3,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        backgroundColor: `${moodColors[mood] || COLORS.textDim}30`,
        border: `2px solid ${moodColors[mood] || COLORS.textDim}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
      }}
    >
      {moodEmoji[mood] || ""}
    </div>
  );
}

export function QuickAction({
  icon,
  label,
  accent,
  href,
}: {
  icon: string;
  label: string;
  accent?: string;
  href?: string;
}) {
  const [hover, setHover] = useState(false);

  const content = (
    <>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 9,
          color: accent || COLORS.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
    </>
  );

  const sharedStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 8px",
    borderRadius: 8,
    border: "none",
    backgroundColor: hover ? `${accent}15` : "transparent",
    cursor: "pointer",
    transition: "all 0.15s",
    minWidth: 72,
    textDecoration: "none",
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={sharedStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={sharedStyle}
    >
      {content}
    </button>
  );
}

export function Skeleton({ width, height }: { width: number | string; height: number }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Skeleton width={8} height={8} />
          <div style={{ flex: 1 }}>
            <Skeleton width="80%" height={14} />
            <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
              <Skeleton width={48} height={16} />
              <Skeleton width={40} height={16} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
