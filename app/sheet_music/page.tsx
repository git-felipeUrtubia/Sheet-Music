// app/sheet_music/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SHEET_MUSIC_CATALOG } from "@/data/catalog";
import { DifficultyLevel } from "@/types/exercise";
import { InstrumentType, MusicGenre } from "@/types/catalog";
import SheetMusicCard from "@/components/catalog/SheetMusicCard";
import ScoreViewer from "@/components/catalog/ScoreViewer";
import ScoreRequestModal from "@/components/email/ScoreRequestModal";

// Opciones tipadas para renderizar los botones de filtro limpiamente
const INSTRUMENT_OPTIONS: { value: "todos" | InstrumentType; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "piano", label: "🎹 Piano" },
    { value: "violin", label: "🎻 Violín" },
    { value: "flute", label: "🪈 Flauta" },
];

const LEVEL_OPTIONS: {
    value: "todos" | DifficultyLevel;
    label: string;
    inactiveClass: string;
}[] = [
        {
            value: "todos",
            label: "Todos",
            inactiveClass: "text-[#E2E8F0] border-blue-900/50",
        },
        {
            value: "principiante",
            label: "Principiante",
            inactiveClass: "text-emerald-400 border-emerald-500/30",
        },
        {
            value: "intermedio",
            label: "Intermedio",
            inactiveClass: "text-blue-400 border-blue-500/30",
        },
        {
            value: "avanzado",
            label: "Avanzado",
            inactiveClass: "text-purple-400 border-purple-500/30",
        },
    ];

const GENRE_OPTIONS: { value: "todos" | MusicGenre; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "anime", label: "Anime" },
    { value: "clasica", label: "Clásica" },
    { value: "rock", label: "Rock" },
    { value: "videojuegos", label: "Videojuegos" },
    { value: "folclore", label: "Folclore" },
];

export default function SheetMusicPage() {
    // 1. Estados de los 3 filtros
    const [selectedInstrument, setSelectedInstrument] = useState<"todos" | InstrumentType>("todos");
    const [selectedLevel, setSelectedLevel] = useState<"todos" | DifficultyLevel>("todos");
    const [selectedGenre, setSelectedGenre] = useState<"todos" | MusicGenre>("todos");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    // Estado preparado para cuando conectemos el visor de partituras
    const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);

    // 2. Lógica de filtrado triple combinada
    const filteredCatalog = SHEET_MUSIC_CATALOG.filter((item) => {
        const matchesInstrument =
            selectedInstrument === "todos" || item.instrument === selectedInstrument;
        const matchesLevel =
            selectedLevel === "todos" || item.level === selectedLevel;
        const matchesGenre =
            selectedGenre === "todos" || item.genre === selectedGenre;

        return matchesInstrument && matchesLevel && matchesGenre;
    });

    // Función rápida para limpiar todos los filtros
    const handleResetFilters = () => {
        setSelectedInstrument("todos");
        setSelectedLevel("todos");
        setSelectedGenre("todos");
    };

    // 2. Dentro de SheetMusicPage(), justo antes del return principal, busca la partitura seleccionada:
    const selectedScore = SHEET_MUSIC_CATALOG.find(
        (item) => item.id === selectedScoreId
    );

    // Si el usuario seleccionó una partitura, renderizamos el Visor Interactivo
    if (selectedScore) {
        return (
            <main className="min-h-screen bg-[#0A1128] text-[#E2E8F0] p-6 md:p-12 flex flex-col select-none">
                <ScoreViewer
                    score={selectedScore}
                    onBack={() => setSelectedScoreId(null)}
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0A1128] text-[#E2E8F0] p-6 md:p-12 flex flex-col select-none">
            <div className="max-w-6xl mx-auto w-full">



                {/* Navegación superior */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                    >
                        <span>←</span>
                        <span>Volver al menú</span>
                    </Link>
                </div>

                {/* Encabezado de la sección */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#F1F5F9] mb-2">
                        Biblioteca de Partituras
                    </h1>
                    <p className="text-sm md:text-base text-[#94A3B8]">
                        Explora el catálogo offline filtrando por instrumento, nivel de dificultad y género musical.
                    </p>

                    <button
                        onClick={() => setIsRequestModalOpen(true)}
                        className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                    >
                        ➕ Sugerir Partitura
                    </button>

                    <ScoreRequestModal
                        isOpen={isRequestModalOpen}
                        onClose={() => setIsRequestModalOpen(false)}
                    />

                </header>


                {/* Panel de Filtros (Instrumento + Nivel + Género) */}
                <section className="bg-[#111C3D] border-2 border-blue-900/50 rounded-2xl p-5 mb-8 shadow-lg flex flex-col gap-5">


                    {/* Fila 1: Filtro por Instrumento */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/40">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                            Instrumento:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {INSTRUMENT_OPTIONS.map((option) => {
                                const isActive = selectedInstrument === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedInstrument(option.value)}
                                        className={`px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${isActive
                                            ? "font-bold bg-blue-600 text-[#F1F5F9] shadow-md"
                                            : "font-semibold bg-[#0A1128] hover:bg-[#162247] text-[#E2E8F0] border border-blue-900/50"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Fila 2: Filtro por Dificultad */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-blue-900/40">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                            Nivel de Dificultad:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {LEVEL_OPTIONS.map((option) => {
                                const isActive = selectedLevel === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedLevel(option.value)}
                                        className={`px-4 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${isActive
                                            ? "font-bold bg-blue-600 text-[#F1F5F9] shadow-md"
                                            : `font-semibold bg-[#0A1128] hover:bg-[#162247] border ${option.inactiveClass}`
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Fila 3: Filtro por Género Musical */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                            Género Musical:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {GENRE_OPTIONS.map((option) => {
                                const isActive = selectedGenre === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setSelectedGenre(option.value)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${isActive
                                            ? "font-bold bg-blue-600 text-[#F1F5F9] shadow-md"
                                            : "font-medium bg-[#0A1128] hover:bg-[#162247] text-[#E2E8F0] border border-blue-900/50"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contador de resultados y botón de limpiar filtros */}
                <div className="flex items-center justify-between mb-4 text-xs font-semibold text-[#94A3B8]">
                    <span>
                        Mostrando {filteredCatalog.length} de {SHEET_MUSIC_CATALOG.length} partituras disponibles
                    </span>
                    {(selectedInstrument !== "todos" ||
                        selectedLevel !== "todos" ||
                        selectedGenre !== "todos") && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        )}
                </div>

                {/* Grid de Partituras o Estado Vacío */}
                {filteredCatalog.length > 0 ? (
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCatalog.map((score) => (
                            <SheetMusicCard
                                key={score.id}
                                {...score}
                                onSelect={(id) => setSelectedScoreId(id)}
                            />
                        ))}
                    </section>
                ) : (
                    <div className="w-full py-16 px-4 text-center bg-[#111C3D]/50 rounded-2xl border border-blue-900/40">
                        <p className="text-base font-semibold text-[#E2E8F0] mb-1">
                            No se encontraron partituras con esa combinación de filtros
                        </p>
                        <p className="text-xs text-[#94A3B8] mb-5">
                            Prueba seleccionando otro instrumento, nivel de dificultad o género musical.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-[#F1F5F9] cursor-pointer transition-all"
                        >
                            Ver todas las partituras
                        </button>
                    </div>
                )}

            </div>
        </main>
    );
}