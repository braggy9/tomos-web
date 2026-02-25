"use client";

import Link from "next/link";
import type { FitnessSession } from "@tomos/api";

interface SessionCardProps {
  session: FitnessSession;
}

const sessionNames: Record<string, string> = {
  A: "Strength + Power",
  B: "Upper + Core",
  C: "CrossFit Fun",
};

export function SessionCard({ session }: SessionCardProps) {
  const date = new Date(session.date);
  const dayName = date.toLocaleDateString("en-AU", { weekday: "short" });
  const dateStr = date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });

  return (
    <Link href={`/history/${session.id}`}>
      <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="text-center w-10">
            <p className="text-[10px] text-gray-400 uppercase">{dayName}</p>
            <p className="text-sm font-bold text-gray-900">{date.getDate()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Session {session.sessionType}
              <span className="text-gray-400 font-normal"> — {sessionNames[session.sessionType] || "Custom"}</span>
            </p>
            {session.notes && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{session.notes}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {session.overallRPE && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              session.overallRPE >= 9 ? "bg-red-100 text-red-700" :
              session.overallRPE >= 7 ? "bg-amber-100 text-amber-700" :
              "bg-brand-100 text-brand-700"
            }`}>
              RPE {session.overallRPE}
            </span>
          )}
          {session.weekType === "kid" && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              Kid
            </span>
          )}
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
