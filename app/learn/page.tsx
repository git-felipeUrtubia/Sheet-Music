"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { THEORY_CHAPTERS, type TheoryChapter } from "@/data/theoryLessons";
import TheoryInteractiveCard from "@/components/learn/TheoryInteractiveCard";
import TheoryQuizCard from "@/components/learn/TheoryQuizCard";
import { getLessons } from "@/lib/sheetData";

const PARTS = [
  { id: 1 as const, label: "Parte 1", hint: "Fundamentos" },
  { id: 2 as const, label: "Parte 2", hint: "Teoría intermedia" },
];

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
            Parte 1 · Fundamentos · Parte 2 · Armonía aplicada
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-rose-950 dark:text-pink-50 md:text-5xl">
            Aprender a Leer Partituras
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
            Empieza por el pentagrama, los tiempos y los silencios. Sigue con el círculo de quintas, los intervalos, los acordes y la lectura a dos manos.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="/exercises"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-2.5 text-sm font-semibold text-rose-950 shadow-lg shadow-pink-300/40"
            >
              Ir a Ejercicios
              <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link
              href="/scales"
              className="inline-flex items-center rounded-full border border-pink-200/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-rose-950 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
            >
              Laboratorio de Escalas
            </Link>
          </div>
        </header>

        <nav className="flex max-h-[70vh] flex-col gap-4 self-start overflow-y-auto lg:sticky lg:top-4 lg:col-span-4 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:max-h-[calc(100vh-2rem)]">
          {PARTS.map((part) => {
            const group = chapters
              .map((chapter, index) => ({ chapter, index }))
              .filter((entry) => (entry.chapter.part ?? 1) === part.id);
            if (group.length === 0) return null;
            return (
              <div key={part.id} className="flex flex-col gap-2">
                <div className="px-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">{part.label}</p>
                  <p className="font-display text-lg text-rose-950 dark:text-pink-50">{part.hint}</p>
                </div>
                {group.map(({ chapter, index }) => {
                  const isActive = index === activeChapterIdx;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => setActiveChapterIdx(index)}
                      className={`cursor-pointer rounded-[1.2rem] border px-4 py-3 text-left transition duration-200 ${
                        isActive
                          ? "border-transparent bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950 shadow-lg shadow-pink-300/40"
                          : "border-pink-200/80 bg-white/75 text-rose-950 dark:border-pink-500/20 dark:bg-slate-900/75 dark:text-pink-50"
                      }`}
                    >
                      <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isActive ? "text-rose-950/70" : "text-rose-400"}`}>
                        Módulo {chapter.moduleCode ?? chapter.stepNumber}
                      </div>
                      <div className="mt-1 font-display text-xl leading-tight">{chapter.title}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <section className="rounded-[2rem] border border-pink-200/80 bg-white/85 p-5 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:p-7 lg:col-span-8 lg:col-start-5">
          <div className="border-b border-pink-100 pb-5 dark:border-pink-500/15">
            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-pink-500/15 dark:text-pink-100">
              Parte {currentChapter.part ?? 1} · Módulo {currentChapter.moduleCode ?? currentChapter.stepNumber}
            </span>
            <h2 className="mt-3 font-display text-3xl text-rose-950 dark:text-pink-50">{currentChapter.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
              {currentChapter.intro}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4">
            {currentChapter.items.map((item) => (
              <TheoryInteractiveCard key={item.id} item={item} />
            ))}
          </div>

          {currentChapter.quiz && currentChapter.quiz.length > 0 && (
            <div className="mt-5">
              <TheoryQuizCard key={currentChapter.id} quizzes={currentChapter.quiz} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-pink-100 pt-5 dark:border-pink-500/15">
            <button
              type="button"
              disabled={activeChapterIdx === 0}
              onClick={() => setActiveChapterIdx((prev) => prev - 1)}
              className="cursor-pointer rounded-full border border-pink-200/80 bg-white/80 px-5 py-2.5 text-xs font-bold text-rose-900 disabled:pointer-events-none disabled:opacity-40 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
            >
              <ArrowLeft className="mr-1.5 inline h-3.5 w-3.5" strokeWidth={1.75} />
              Lección Anterior
            </button>

            {activeChapterIdx < chapters.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveChapterIdx((prev) => prev + 1)}
                className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-2.5 text-xs font-bold text-rose-950 shadow-lg shadow-pink-300/40"
              >
                Siguiente Lección
                <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/scales"
                  className="inline-flex items-center rounded-full border border-pink-200/80 bg-white/80 px-5 py-2.5 text-xs font-bold text-rose-950 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
                >
                  Practicar escalas
                </Link>
                <Link
                  href="/exercises"
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-300 to-teal-300 px-6 py-2.5 text-xs font-bold text-emerald-950 shadow-lg"
                >
                  Comenzar práctica
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
