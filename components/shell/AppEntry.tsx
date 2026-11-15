"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import WebLandingPage from "@/components/landing/WebLandingPage";
import AppShell from "@/components/shell/AppShell";

const WEB_ENTERED_KEY = "sheetmusic_web_entered";

type EntryMode = "both" | "landing" | "app";

function isDesktopRuntime() {
  return typeof window !== "undefined" && Boolean(window.electronAPI || window.electronDB);
}

function resolveEntry(): "desktop" | "webapp" | "landing" {
  if (isDesktopRuntime()) return "desktop";
  try {
    if (sessionStorage.getItem(WEB_ENTERED_KEY) === "1") return "webapp";
  } catch {
    return "landing";
  }
  return "landing";
}

function publishEntry(entry: "desktop" | "webapp" | "landing") {
  document.documentElement.setAttribute("data-sheet-entry", entry);
}

export default function AppEntry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EntryMode>("both");

  useLayoutEffect(() => {
    const entry = resolveEntry();
    publishEntry(entry);
    setMode(entry === "landing" ? "landing" : "app");
  }, []);

  const enterApp = () => {
    try {
      sessionStorage.setItem(WEB_ENTERED_KEY, "1");
    } catch {
      /* sesión privada: igual se entra a la app en esta vista */
    }
    publishEntry("webapp");
    setMode("app");
  };

  const showLanding = () => {
    if (isDesktopRuntime()) return;
    try {
      sessionStorage.removeItem(WEB_ENTERED_KEY);
    } catch {
      /* sin sessionStorage la portada vuelve solo en esta vista */
    }
    publishEntry("landing");
    setMode("landing");
  };

  const showLandingTree = mode === "both" || mode === "landing";
  const showAppTree = mode === "both" || mode === "app";

  return (
    <>
      {showLandingTree && (
        <div className="sheet-landing-root">
          <WebLandingPage onEnterApp={enterApp} />
        </div>
      )}
      {showAppTree && (
        <div className="sheet-app-root">
          <AppShell onShowLanding={showLanding}>{children}</AppShell>
        </div>
      )}
    </>
  );
}
