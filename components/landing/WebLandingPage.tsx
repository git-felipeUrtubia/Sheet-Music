"use client";

import { useLayoutEffect, useState } from "react";
import {
  Download,
  Globe,
  type LucideIcon,
  Mail,
  Moon,
  Music,
  Play,
  Sparkles,
  Sun,
  Target,
  Zap,
} from "lucide-react";
import ScoreRequestModal from "@/components/email/ScoreRequestModal";

export const WINDOWS_DOWNLOAD_URL =
  "https://github.com/git-felipeUrtubia/Sheet-Music-Releases/releases/download/v1.0.0/SheetMusic-Setup-0.1.0.exe";

const THEME_KEY = "sheetmusic-theme";
const GITHUB_URL = "https://github.com/git-felipeUrtubia/Sheet-Music";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Zap,
    title: "Rendimiento Nativo & 100% Offline",
    text: "Base de datos SQLite local ultrarrápida para practicar sin conexión a internet.",
  },
  {
    icon: Music,
    title: "Catálogo Interactivo MusicXML & PDF",
    text: "Visor de partituras de alta precisión filtrado por nivel (Principiante, Intermedio, Avanzado) e instrumento.",
  },
  {
    icon: Target,
    title: "Ejercicios de Lectura Musical",
    text: "Entrenamiento práctico en clave de sol y clave de fa con seguimiento de progreso local.",
  },
  {
    icon: Mail,
    title: "Comunidad Activa",
    text: "Sistema integrado para solicitar nuevas partituras para futuras actualizaciones.",
  },
];

interface WebLandingPageProps {
  onEnterApp: () => void;
}

export function WebDownloadLink({
  onShowLanding,
  className = "",
}: {
  onShowLanding?: () => void;
  className?: string;
}) {
  return (
    <div className={`web-download-cluster items-center gap-2 ${className}`}>
      <a
        href={WINDOWS_DOWNLOAD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-pink-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-rose-950 shadow-lg shadow-pink-200/30 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-pink-500/25 dark:bg-slate-900/90 dark:text-pink-50 dark:shadow-black/40"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
        Descargar para Windows
      </a>
      {onShowLanding && (
        <button
          type="button"
          onClick={onShowLanding}
          className="cursor-pointer rounded-full px-2 py-2 text-[11px] font-semibold text-rose-500 underline decoration-rose-300 underline-offset-4 dark:text-pink-300"
        >
          Volver a la portada
        </button>
      )}
    </div>
  );
}

export default function WebLandingPage({ onEnterApp }: WebLandingPageProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
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

  return (
    <div className="relative min-h-screen overflow-x-hidden">
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

      <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-pink-200/80 bg-white/85 px-3 py-2 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40">
          <div className="flex min-w-0 items-center gap-2.5 pl-1">
            <img
              src="/icon2.png"
              alt=""
              className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-md shadow-pink-300/40"
            />
            <span className="truncate font-display text-xl text-rose-950 dark:text-pink-50">
              SheetMusic
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Activar tema claro" : "Activar tema oscuro"}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-pink-200/80 bg-white/70 text-rose-950 transition hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/50 dark:text-pink-50"
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onEnterApp}
              className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-3.5 py-2 text-xs font-semibold text-rose-950 shadow-lg shadow-pink-300/40 transition hover:brightness-105 sm:px-4 sm:text-sm"
            >
              Abrir Web App
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-28">
        <section className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="studio-rise">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-pink-200/80 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-rose-800 shadow-sm dark:border-pink-500/25 dark:bg-slate-900/70 dark:text-pink-100">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
              Estudio interactivo de partituras para Piano, Violín y Flauta
            </p>
            <h1 className="mt-5 max-w-xl font-display text-5xl leading-[0.98] text-rose-950 dark:text-pink-50 sm:text-6xl">
              Practica lectura musical con el pulso de un estudio real.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-rose-900/70 dark:text-pink-100/65">
              Escucha cada obra, sigue el cursor sobre la partitura y entrena clave de sol y clave de fa. En Windows queda todo en tu computador; en el navegador puedes probarlo al instante.
            </p>

            <div className="mt-8 flex flex-col items-start gap-4">
              <div>
                <a
                  href={WINDOWS_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-3.5 text-sm font-bold text-rose-950 shadow-xl shadow-pink-300/40 transition hover:-translate-y-0.5"
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Descargar para Windows (.exe)
                </a>
                <p className="mt-2 pl-1 text-xs text-rose-900/60 dark:text-pink-100/55">
                  Versión de escritorio 100% offline • Windows 10 / 11 (64-bit)
                </p>
              </div>
              <button
                type="button"
                onClick={onEnterApp}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-pink-200/80 bg-white/80 px-6 py-3.5 text-sm font-semibold text-rose-950 shadow-lg shadow-pink-200/25 backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-pink-500/25 dark:bg-slate-900/75 dark:text-pink-50"
              >
                <Globe className="h-4 w-4" strokeWidth={1.75} />
                Usar versión Web en el navegador
              </button>
            </div>
          </div>

          <div className="studio-rise" style={{ animationDelay: "120ms" }}>
            <div className="rounded-[1.7rem] border border-pink-200/80 bg-white/55 p-3 shadow-2xl shadow-pink-300/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/50 dark:shadow-black/50">
              <div className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-[#FFFDFB] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-pink-500/15 dark:bg-[#12141f]">
                <div className="flex items-center justify-between border-b border-pink-100 bg-white/90 px-3 py-2 dark:border-pink-500/15 dark:bg-slate-950/80">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src="/icon2.png" alt="" className="h-5 w-5 rounded-md object-cover" />
                    <span className="truncate text-xs font-semibold text-rose-950 dark:text-pink-50">
                      SheetMusic
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-200 dark:bg-slate-600" />
                    <span className="h-2.5 w-2.5 rounded-full bg-pink-300 dark:bg-pink-400/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  </div>
                </div>
                <div className="grid grid-cols-[4.5rem_1fr] gap-3 p-3 sm:grid-cols-[7rem_1fr] sm:p-4">
                  <div className="flex flex-col gap-2">
                    {["Estudio", "Catálogo", "Aprender", "Práctica"].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-xl px-2 py-2 text-[10px] font-semibold sm:text-xs ${
                          index === 1
                            ? "bg-gradient-to-r from-pink-400 to-rose-400 text-rose-950"
                            : "bg-pink-50 text-rose-800 dark:bg-slate-950/70 dark:text-pink-100"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[1.1rem] border border-pink-100 bg-white/90 p-3 dark:border-pink-500/15 dark:bg-slate-900/80">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-400">
                      En el atril
                    </p>
                    <p className="mt-1 font-display text-2xl text-rose-950 dark:text-pink-50">
                      Je Te Laisserai Des Mots
                    </p>
                    <p className="mt-1 text-[11px] text-rose-900/55 dark:text-pink-100/50">
                      Patrick Watson · Piano · Principiante
                    </p>
                    <div className="mt-4 space-y-2" aria-hidden>
                      {[0, 1, 2, 3, 4].map((line) => (
                        <div
                          key={line}
                          className="h-px bg-rose-950/25 dark:bg-pink-100/35"
                        />
                      ))}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold text-rose-700 dark:bg-pink-500/15 dark:text-pink-100">
                      <Play className="h-3 w-3 fill-current" strokeWidth={1.75} />
                      Reproducir obra
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="studio-rise" style={{ animationDelay: "180ms" }}>
          <h2 className="font-display text-3xl text-rose-950 dark:text-pink-50 sm:text-4xl">
            ¿Por qué descargar la versión para Windows?
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
              <article
                key={feature.title}
                className={`rounded-[1.6rem_2rem_1.4rem_1.8rem] border border-pink-200/80 bg-white/85 p-6 shadow-xl shadow-pink-200/25 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 ${
                  index === 0 ? "md:col-span-2" : ""
                }`}
              >
                <Icon className="h-6 w-6 text-rose-500 dark:text-pink-300" strokeWidth={1.75} aria-hidden />
                <h3 className="mt-3 font-display text-2xl text-rose-950 dark:text-pink-50">
                  {feature.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
                  {feature.text}
                </p>
              </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 pb-8 text-center sm:flex-row sm:text-left">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-pink-200"
        >
          git-felipeUrtubia/Sheet-Music
        </a>
        <p className="text-xs text-rose-900/60 dark:text-pink-100/55">Disponible para Windows y Web</p>
        <button
          type="button"
          onClick={() => setRequestOpen(true)}
          className="cursor-pointer text-sm font-semibold text-rose-700 underline decoration-rose-300 underline-offset-4 dark:text-pink-200"
        >
          Sugerir Partitura
        </button>
      </footer>

      <ScoreRequestModal isOpen={requestOpen} onClose={() => setRequestOpen(false)} />
    </div>
  );
}
