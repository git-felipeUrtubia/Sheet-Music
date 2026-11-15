"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState, type ReactNode } from "react";
import {
  AudioLines,
  GraduationCap,
  House,
  KeyboardMusic,
  Library,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import SettingsModal from "@/components/settings/SettingsModal";
import ScoreRequestModal from "@/components/email/ScoreRequestModal";

const THEME_KEY = "sheetmusic-theme";

const NAV = [
  { href: "/", label: "Estudio", icon: House },
  { href: "/sheet_music", label: "Catálogo", icon: Library },
  { href: "/learn", label: "Aprender", icon: GraduationCap },
  { href: "/exercises", label: "Práctica", icon: KeyboardMusic },
] as const;

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    const next = stored === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  const linkClass = (active: boolean, compact = false) =>
    `flex items-center gap-3 rounded-2xl transition duration-200 ${
      compact ? "flex-col gap-1 px-1 py-2 text-[10px]" : "px-3 py-3 text-sm"
    } font-medium ${
      active
        ? "bg-gradient-to-r from-pink-400 to-rose-400 text-rose-950 shadow-lg shadow-pink-300/40"
        : "text-rose-950/70 hover:bg-pink-100/80 dark:text-pink-50/80 dark:hover:bg-white/5"
    }`;

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="halo-drift absolute -left-24 -top-28 h-[30rem] w-[30rem] rounded-full bg-rose-200/80 blur-3xl dark:bg-pink-500/15" />
        <div
          className="halo-drift absolute right-[-8rem] top-1/4 h-[26rem] w-[26rem] rounded-full bg-violet-200/70 blur-3xl dark:bg-fuchsia-500/10"
          style={{ animationDelay: "-7s" }}
        />
        <div className="absolute bottom-[-6rem] left-1/3 h-80 w-80 rounded-full bg-[#FDF2F8] blur-3xl dark:bg-rose-500/10" />
        <div
          className="absolute inset-0 opacity-70 dark:opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 52px, rgba(244,114,182,0.09) 52px, rgba(244,114,182,0.09) 53px)",
          }}
        />
      </div>

      <aside className="fixed bottom-4 left-4 top-4 z-40 hidden w-[220px] flex-col rounded-[1.8rem] border border-pink-200/80 bg-white/85 p-3 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:flex">
        <div className="flex items-center gap-3 px-2 pb-3 pt-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950 shadow-lg shadow-pink-300/40">
            <AudioLines className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="font-display text-xl leading-none text-rose-950 dark:text-pink-50">
              SheetMusic
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-400">
              Estudio
            </p>
          </div>
        </div>

        <nav className="mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = isCurrent(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 shrink-0 space-y-2">
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-3 py-3 text-sm font-semibold text-rose-950 shadow-lg shadow-pink-300/40 transition hover:brightness-105 active:scale-[0.98]"
          >
            ➕ Sugerir Partitura
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-pink-200/80 bg-white/70 py-2.5 text-xs font-semibold text-rose-950 transition hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/50 dark:text-pink-50"
            >
              {theme === "dark" ? (
                <Moon className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Sun className="h-4 w-4" strokeWidth={1.75} />
              )}
              {theme === "dark" ? "Luna" : "Sol"}
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Configuración"
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-pink-200/80 bg-white/70 py-2.5 text-xs font-semibold text-rose-950 transition hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/50 dark:text-pink-50"
            >
              <Settings className="h-4 w-4" strokeWidth={1.75} />
              Ajustes
            </button>
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-4 top-4 z-40 flex items-center gap-2 md:hidden">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-pink-200/80 bg-white/85 px-3 py-2 shadow-lg shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950">
            <AudioLines className="h-4 w-4" />
          </span>
          <span className="truncate font-display text-lg text-rose-950 dark:text-pink-50">
            SheetMusic
          </span>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
          className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-pink-200/80 bg-white/85 text-rose-950 shadow-lg shadow-pink-200/25 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:text-pink-50"
        >
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Configuración"
          className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-pink-200/80 bg-white/85 text-rose-950 shadow-lg shadow-pink-200/25 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:text-pink-50"
        >
          <Settings className="h-4 w-4" />
        </button>
      </header>

      <nav className="fixed inset-x-4 bottom-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setRequestOpen(true)}
          className="mb-2 flex w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-3 text-sm font-semibold text-rose-950 shadow-lg shadow-pink-300/40"
        >
          ➕ Sugerir Partitura
        </button>
        <div className="grid grid-cols-4 rounded-[1.6rem] border border-pink-200/80 bg-white/90 p-1.5 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/85 dark:shadow-black/40">
          {NAV.map((item) => {
            const active = isCurrent(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active, true)}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="relative z-10 px-4 pb-44 pt-24 md:pb-8 md:pl-[256px] md:pr-6 md:pt-6">
        {children}
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ScoreRequestModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}
