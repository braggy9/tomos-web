"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  padding = true,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${
        onClick ? "cursor-pointer hover:border-gray-300 hover:shadow-md transition-all" : ""
      } ${padding ? "p-4" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
