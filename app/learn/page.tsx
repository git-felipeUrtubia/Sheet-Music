"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THEORY_CHAPTERS, type TheoryChapter } from "@/data/theoryLessons";
import TheoryInteractiveCard from "@/components/learn/TheoryInteractiveCard";
import { getLessons } from "@/lib/sheetData";

export default function LearnSheetMusicPage() {
  const [chapters, setChapters] = useState<TheoryChapter[]>(THEORY_CHAPTERS);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const currentChapter = chapters[activeChapterIdx] ?? chapters[0];

  useEffect(() => {
    let active = true;
    getLessons()
      .then((rows) => {
        if (active && rows.length > 0) setChapters(rows);
      })
      .catch((error) => {
        console.error("No se pudieron cargar las lecciones:", error);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!currentChapter) return null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <header className="studio-rise rounded-[2rem_2.5rem_1.6rem_2rem] border border-pink-200/80 bg-white/85 p-7 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:p-9 lg:col-span-8 lg:col-start-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">
            Guía desde cero
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-rose-950 dark:text-pink-50 md:text-5xl">
            Aprender a Leer Partituras desde Cero
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
            Guía interactiva de tiempos, silencios y símbolos antes de tu primera práctica.
          </p>
          <Link
            href="/exercises"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-2.5 text-sm font-semibold text-rose-950 shadow-lg shadow-pink-300/40"
          >
            Ir a Ejercicios Prácticos →
          </Link>
        </header>

        <nav className="flex flex-col gap-3 self-start lg:sticky lg:top-4 lg:col-span-4 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          {chapters.map((chap, idx) => {
            const isActive = idx === activeChapterIdx;
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => setActiveChapterIdx(idx)}
                className={`flex min-h-[6.85rem] cursor-pointer flex-col justify-center rounded-[1.4rem_1.9rem_1.3rem_1.7rem] border px-4 py-3.5 text-left transition duration-200 ${
                  isActive
                    ? "border-transparent bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950 shadow-lg shadow-pink-300/40"
                    : "border-pink-200/80 bg-white/75 text-rose-950 dark:border-pink-500/20 dark:bg-slate-900/75 dark:text-pink-50"
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isActive ? "text-rose-950/70" : "text-rose-400"}`}>
                  Paso {chap.stepNumber} de {chapters.length}
                </div>
                <div className="mt-1 font-display text-2xl leading-tight">{chap.title}</div>
              </button>
            );
          })}
        </nav>

        <section className="rounded-[2rem] border border-pink-200/80 bg-white/85 p-5 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:p-7 lg:col-span-8 lg:col-start-5">
          <div className="border-b border-pink-100 pb-5 dark:border-pink-500/15">
            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-pink-500/15 dark:text-pink-100">
              Lección {currentChapter.stepNumber}
            </span>
            <h2 className="mt-3 font-display text-3xl text-rose-950 dark:text-pink-50">
              {currentChapter.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
              {currentChapter.intro}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            {currentChapter.items.map((item) => (
              <TheoryInteractiveCard key={item.id} item={item} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-pink-100 pt-5 dark:border-pink-500/15">
            <button
              type="button"
              disabled={activeChapterIdx === 0}
              onClick={() => setActiveChapterIdx((prev) => prev - 1)}
              className="cursor-pointer rounded-full border border-pink-200/80 bg-white/80 px-5 py-2.5 text-xs font-bold text-rose-900 disabled:pointer-events-none disabled:opacity-40 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
            >
              ← Lección Anterior
            </button>

            {activeChapterIdx < chapters.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveChapterIdx((prev) => prev + 1)}
                className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-2.5 text-xs font-bold text-rose-950 shadow-lg shadow-pink-300/40"
              >
                Siguiente Lección →
              </button>
            ) : (
              <Link
                href="/exercises"
                className="rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 px-6 py-2.5 text-xs font-bold text-emerald-950 shadow-lg"
              >
                ¡Listo! Comenzar Práctica Principiante →
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
