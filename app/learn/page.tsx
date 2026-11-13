// app/learn/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { THEORY_CHAPTERS } from "@/data/theoryLessons";
import TheoryInteractiveCard from "@/components/learn/TheoryInteractiveCard";

export default function LearnSheetMusicPage() {
    const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
    const currentChapter = THEORY_CHAPTERS[activeChapterIdx];

    return (
        <main className="min-h-screen bg-[#0A1128] text-[#E2E8F0] p-6 md:p-12 flex flex-col select-none">
            <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

                {/* Encabezado Superior */}
                <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-900/50">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-blue-300 transition-colors"
                        >
                            ← Menú Principal
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F1F5F9]">
                                Aprender a Leer Partituras desde Cero
                            </h1>
                            <p className="text-xs md:text-sm text-[#94A3B8]">
                                Guía interactiva de tiempos, silencios y símbolos antes de tu primera práctica.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/exercises"
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs md:text-sm font-bold text-white shadow-lg transition-all"
                    >
                        Ir a Ejercicios Prácticos →
                    </Link>
                </header>

                {/* Selector de Pasos / Capítulos */}
                <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {THEORY_CHAPTERS.map((chap, idx) => {
                        const isActive = idx === activeChapterIdx;
                        return (
                            <button
                                key={chap.id}
                                type="button"
                                onClick={() => setActiveChapterIdx(idx)}
                                className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all ${isActive
                                        ? "bg-[#162247] border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                                        : "bg-[#111C3D]/70 border-blue-900/50 hover:bg-[#162247]/60 text-[#94A3B8]"
                                    }`}
                            >
                                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                                    Paso {chap.stepNumber} de {THEORY_CHAPTERS.length}
                                </div>
                                <div className="text-sm font-extrabold text-[#F1F5F9] mt-1">
                                    {chap.title}
                                </div>
                            </button>
                        );
                    })}
                </nav>

                {/* Contenedor del Capítulo Activo */}
                <section className="bg-[#111C3D] border-2 border-blue-900/60 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                    <div className="border-b border-blue-900/50 pb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                            Lección {currentChapter.stepNumber}
                        </span>
                        <h2 className="text-xl md:text-2xl font-extrabold text-[#F1F5F9] mt-2">
                            {currentChapter.title}
                        </h2>
                        <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed max-w-4xl">
                            {currentChapter.intro}
                        </p>
                    </div>

                    {/* Grilla de tarjetas interactivas con pentagrama y audio */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {currentChapter.items.map((item) => (
                            <TheoryInteractiveCard key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Botones de navegación entre capítulos */}
                    <div className="pt-6 border-t border-blue-900/50 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={activeChapterIdx === 0}
                            onClick={() => setActiveChapterIdx((prev) => prev - 1)}
                            className="px-5 py-2.5 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-xs font-bold text-blue-300 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                        >
                            ← Lección Anterior
                        </button>

                        {activeChapterIdx < THEORY_CHAPTERS.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setActiveChapterIdx((prev) => prev + 1)}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg cursor-pointer"
                            >
                                Siguiente Lección →
                            </button>
                        ) : (
                            <Link
                                href="/exercises"
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
                            >
                                ¡Listo! Comenzar Práctica Principiante →
                            </Link>
                        )}
                    </div>
                </section>

            </div>
        </main>
    );
}