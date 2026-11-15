"use client";

import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { TheoryQuiz } from "@/data/theoryLessons";

export default function TheoryQuizCard({ quizzes }: { quizzes: TheoryQuiz[] }) {
  const [picked, setPicked] = useState<Record<string, number>>({});

  const correctCount = quizzes.filter((quiz) => picked[quiz.id] === quiz.answerIndex).length;
  const answered = Object.keys(picked).length;

  return (
    <section className="rounded-[1.6rem] border border-pink-200/80 bg-white/70 p-5 dark:border-pink-500/20 dark:bg-slate-950/35">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">Comprobación</p>
          <h3 className="mt-1 font-display text-2xl text-rose-950 dark:text-pink-50">Mini-quiz del módulo</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-pink-500/15 dark:text-pink-100">
            {correctCount}/{quizzes.length} correctas
          </span>
          {answered > 0 && (
            <button
              type="button"
              onClick={() => setPicked({})}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-pink-200/80 px-3 py-1 text-xs font-semibold text-rose-800 dark:border-pink-500/25 dark:text-pink-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reintentar
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {quizzes.map((quiz, quizIndex) => {
          const choice = picked[quiz.id];
          const answeredThis = choice !== undefined;
          return (
            <article key={quiz.id} className="rounded-[1.2rem] border border-pink-100 bg-rose-50/60 p-4 dark:border-pink-500/15 dark:bg-slate-900/50">
              <p className="text-sm font-semibold text-rose-950 dark:text-pink-50">
                {quizIndex + 1}. {quiz.prompt}
              </p>
              <div className="mt-3 grid gap-2">
                {quiz.options.map((option, optionIndex) => {
                  const isChosen = choice === optionIndex;
                  const isAnswer = optionIndex === quiz.answerIndex;
                  const state = !answeredThis
                    ? "idle"
                    : isAnswer
                      ? "right"
                      : isChosen
                        ? "wrong"
                        : "idle";
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={answeredThis}
                      onClick={() => setPicked((prev) => ({ ...prev, [quiz.id]: optionIndex }))}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition disabled:cursor-default ${
                        state === "right"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-50"
                          : state === "wrong"
                            ? "border-rose-300 bg-rose-100 text-rose-950 dark:border-rose-400/40 dark:bg-rose-500/15 dark:text-rose-50"
                            : "border-pink-200/80 bg-white/80 text-rose-950 hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{option}</span>
                      {state === "right" && <Check className="h-4 w-4 shrink-0" />}
                      {state === "wrong" && <X className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {answeredThis && (
                <p className="mt-3 text-xs leading-relaxed text-rose-900/70 dark:text-pink-100/70">{quiz.explanation}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
