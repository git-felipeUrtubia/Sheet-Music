"use client";

import { useState } from "react";
import { DifficultyLevel } from "@/types/exercise";
import { InstrumentType, MusicGenre } from "@/types/catalog";
import SheetMusicCard from "@/components/catalog/SheetMusicCard";
import ScoreViewer from "@/components/catalog/ScoreViewer";
import { useCatalog } from "@/hooks/useCatalog";
import { useFavorites } from "@/hooks/useFavorites";
import { filterScores } from "@/lib/sheetData";

const INSTRUMENT_OPTIONS: { value: "todos" | InstrumentType; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "piano", label: "🎹 Piano" },
  { value: "violin", label: "🎻 Violín" },
  { value: "flute", label: "🪈 Flauta" },
];

const LEVEL_OPTIONS: {
  value: "todos" | DifficultyLevel;
  label: string;
  dot: string;
}[] = [
  { value: "todos", label: "Todos", dot: "bg-rose-300" },
  { value: "principiante", label: "Principiante", dot: "bg-emerald-400" },
  { value: "intermedio", label: "Intermedio", dot: "bg-sky-400" },
  { value: "avanzado", label: "Avanzado", dot: "bg-violet-400" },
];

const GENRE_OPTIONS: { value: "todos" | MusicGenre; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "anime", label: "Anime" },
  { value: "clasica", label: "Clásica" },
  { value: "rock", label: "Rock" },
  { value: "videojuegos", label: "Videojuegos" },
  { value: "folclore", label: "Folclore" },
];

const pillClass = (active: boolean) =>
  `inline-flex cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs transition ${
    active
      ? "bg-gradient-to-r from-pink-400 to-rose-400 font-bold text-rose-950 shadow-md shadow-pink-300/40"
      : "border border-pink-200/80 bg-white/70 font-medium text-rose-950 hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50 dark:hover:bg-white/5"
  }`;

export default function SheetMusicPage() {
  const catalog = useCatalog();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedInstrument, setSelectedInstrument] = useState<"todos" | InstrumentType>("todos");
  const [selectedLevel, setSelectedLevel] = useState<"todos" | DifficultyLevel>("todos");
  const [selectedGenre, setSelectedGenre] = useState<"todos" | MusicGenre>("todos");
  const [query, setQuery] = useState("");
  const [selectedScoreId, setSelectedScoreId] = useState<string | null>(null);

  const filteredCatalog = filterScores(catalog, {
    instrument: selectedInstrument,
    level: selectedLevel,
    genre: selectedGenre,
    query,
  });

  const handleResetFilters = () => {
    setSelectedInstrument("todos");
    setSelectedLevel("todos");
    setSelectedGenre("todos");
    setQuery("");
  };

  const selectedScore = catalog.find((item) => item.id === selectedScoreId);
  const filtersActive =
    selectedInstrument !== "todos" ||
    selectedLevel !== "todos" ||
    selectedGenre !== "todos" ||
    query.trim().length > 0;

  if (selectedScore) {
    return <ScoreViewer score={selectedScore} onBack={() => setSelectedScoreId(null)} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <header className="studio-rise rounded-[2rem_2.6rem_1.6rem_2rem] border border-pink-200/80 bg-white/85 p-7 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 lg:col-span-8 md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">
            Repertorio offline
          </p>
          <h1 className="mt-3 font-display text-4xl text-rose-950 dark:text-pink-50 md:text-5xl">
            Biblioteca de Partituras
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60 md:text-base">
            Explora el catálogo offline filtrando por instrumento, nivel de dificultad y género musical.
          </p>
          <label className="mt-5 flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/70 px-4 py-2 text-sm text-rose-950 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50">
            <span className="text-rose-400" aria-hidden>
              ⌕
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, compositor o instrumento"
              className="w-full bg-transparent text-sm outline-none placeholder:text-rose-900/40 dark:placeholder:text-pink-100/35"
            />
          </label>
        </header>

        <aside className="studio-rise flex flex-col justify-between rounded-[1.6rem_2.2rem_2.4rem_1.4rem] border border-pink-200/80 bg-[#FDF2F8]/90 p-6 shadow-xl shadow-pink-200/25 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/75 lg:col-span-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">
            En el atril
          </p>
          <p className="font-display text-6xl leading-none text-rose-950 dark:text-pink-50">
            {filteredCatalog.length}
            <span className="ml-2 text-2xl text-rose-400">/ {catalog.length}</span>
          </p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-xs text-rose-900/60 dark:text-pink-100/55">
              Mostrando {filteredCatalog.length} de {catalog.length} partituras disponibles
            </p>
            {filtersActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="shrink-0 cursor-pointer text-xs font-semibold text-rose-600 underline decoration-rose-300 underline-offset-4 dark:text-pink-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        <section className="rounded-[1.6rem] border border-pink-200/80 bg-white/80 p-5 shadow-lg shadow-pink-200/20 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/75 dark:shadow-black/30 lg:col-span-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-400">
            Instrumento:
          </p>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedInstrument(option.value)}
                className={pillClass(selectedInstrument === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[1.6rem] border border-pink-200/80 bg-white/80 p-5 shadow-lg shadow-pink-200/20 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/75 dark:shadow-black/30 lg:col-span-7">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-400">
            Nivel de Dificultad:
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVEL_OPTIONS.map((option) => {
              const isActive = selectedLevel === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedLevel(option.value)}
                  className={pillClass(isActive)}
                >
                  <span className={`mr-2 h-1.5 w-1.5 rounded-full ${option.dot}`} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.8rem] border border-pink-200/80 bg-white/80 p-5 shadow-lg shadow-pink-200/20 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/75 dark:shadow-black/30 lg:col-span-12">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-400">
            Género Musical:
          </p>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedGenre(option.value)}
                className={pillClass(selectedGenre === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      {filteredCatalog.length > 0 ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredCatalog.map((score, index) => {
            const emphasis = index % 5 === 0;
            return (
              <div
                key={score.id}
                className={`studio-rise ${emphasis ? "md:col-span-2" : ""}`}
                style={{ animationDelay: `${(index % 8) * 45}ms` }}
              >
                <SheetMusicCard
                  {...score}
                  emphasis={emphasis}
                  favorite={isFavorite(score.id)}
                  onToggleFavorite={toggleFavorite}
                  onSelect={(id) => setSelectedScoreId(id)}
                />
              </div>
            );
          })}
        </section>
      ) : (
        <div className="rounded-[2rem] border border-pink-200/70 bg-white/70 px-6 py-16 text-center shadow-lg backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/60">
          <p className="font-display text-2xl text-rose-950 dark:text-pink-50">
            No se encontraron partituras con esa combinación de filtros
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-rose-900/60 dark:text-pink-100/55">
            Prueba seleccionando otro instrumento, nivel de dificultad o género musical.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-6 cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-2.5 text-xs font-bold text-rose-950 shadow-lg shadow-pink-300/40"
          >
            Ver todas las partituras
          </button>
        </div>
      )}
    </div>
  );
}
