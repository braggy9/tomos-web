"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "../components/Header";
import { QuickActions } from "../components/QuickActions";
import { TasksPanel } from "../components/TasksPanel";
import { MattersPanel } from "../components/MattersPanel";
import { TrainingPanel } from "../components/TrainingPanel";
import { JournalPanel } from "../components/JournalPanel";
import { CalendarPanel } from "../components/CalendarPanel";
import { COLORS } from "../components/ui";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    // Brief visual delay so the spinner is visible
    await new Promise((r) => setTimeout(r, 400));
    setRefreshing(false);
  }, [queryClient]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      const atTop = window.scrollY <= 0;
      if (atTop && delta > 80 && !refreshing) {
        handleRefresh();
      }
    },
    [handleRefresh, refreshing]
  );

  return (
    <div
      ref={scrollRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        padding: "24px 20px 40px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0",
            marginBottom: 8,
          }}
        >
          <div className="ptr-spinner" />
        </div>
      )}

      <Header />
      <QuickActions />

      <div className="dashboard-grid">
        <TasksPanel />
        <MattersPanel />
        <CalendarPanel />
        <TrainingPanel />
        <JournalPanel />
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 24,
          fontFamily: "var(--font-display)",
          fontSize: 9,
          color: COLORS.textDim,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        TomOS v2 · Command Tower · {new Date().getFullYear()}
      </div>
    </div>
  );
}
