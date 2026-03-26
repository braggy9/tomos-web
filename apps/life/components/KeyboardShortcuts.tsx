"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.metaKey && e.altKey && e.key === "e") {
        e.preventDefault();
        window.location.href = "mailto:tasks@tomos.run";
      }
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        router.push("/habits");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
