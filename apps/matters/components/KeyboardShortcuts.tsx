"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const notEditing = !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName);
      if (e.metaKey && e.key === "n" && notEditing) {
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
