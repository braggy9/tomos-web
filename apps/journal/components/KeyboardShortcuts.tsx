"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.key === "n" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        router.push("/new");
      }
      if (e.metaKey && e.altKey && e.key === "e") {
        e.preventDefault();
        window.location.href = "mailto:tasks@tomos.run";
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
