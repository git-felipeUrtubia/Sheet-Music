// components/catalog/SheetMusicCard.tsx
import React from "react";
import { DifficultyLevel, ClefType } from "@/types/exercise";
import { InstrumentType, MusicGenre } from "@/types/catalog";

export interface SheetMusicCardProps {
    id: string;
    title: string;
    composer: string;
    level: DifficultyLevel;
    genre: MusicGenre;
    instrument: InstrumentType;
    clef: ClefType | "grand";
    timeSignature: "4/4" | "3/4" | "2/4" | "6/8";
    bpm: number;
    measuresCount: number;
    scoreFile: string;
    onSelect?: (id: string) => void;
}

// Estilos dinámicos según el nivel recibido por parámetro
const LEVEL_BADGE_STYLES: Record<DifficultyLevel, string> = {
    principiante: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    intermedio: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    avanzado: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const INSTRUMENT_LABELS: Record<InstrumentType, string> = {
    piano: "🎹 Piano",
    violin: "🎻 Violín",
    flute: "🪈 Flauta",
};

const CLEF_LABELS: Record<ClefType | "grand", string> = {
    treble: "Sol",
    bass: "Fa",
    grand: "Ambas",
};

export default function SheetMusicCard({
    id,
    title,
    composer,
    level,
    genre,
    instrument,
    clef,
    timeSignature,
    bpm,
    measuresCount,
    onSelect,
}: SheetMusicCardProps) {
    return (
        <article className="group flex flex-col justify-between p-6 rounded-2xl bg-[#111C3D] hover:bg-[#172652] border-2 border-blue-900/50 hover:border-blue-400/80 transition-all duration-200 hover:-translate-y-1 shadow-lg">
            <div>
                {/* Badges superiores: Nivel + Instrumento y Género */}
                <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                        className={`px-3 py-1 text-xs font-semibold capitalize rounded-full border ${LEVEL_BADGE_STYLES[level]}`}
                    >
                        {level}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {INSTRUMENT_LABELS[instrument]}
                        </span>
                        <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-[#0A1128] text-blue-300 border border-blue-800/50">
                            {genre}
                        </span>
                    </div>
                </div>

                {/* Título y Compositor */}
                <h2 className="text-xl font-bold text-[#F1F5F9] group-hover:text-blue-300 transition-colors mb-1">
                    {title}
                </h2>
                <p className="text-xs text-[#94A3B8] mb-5">
                    {composer} • {measuresCount} compases
                </p>

                {/* Metadatos técnicos de la partitura */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#0A1128]/80 border border-blue-900/40 text-center">
                    <div>
                        <span className="block text-[10px] uppercase text-[#94A3B8]">
                            Compás
                        </span>
                        <span className="text-xs font-bold text-[#E2E8F0]">
                            {timeSignature}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase text-[#94A3B8]">
                            Tempo
                        </span>
                        <span className="text-xs font-bold text-[#E2E8F0]">{bpm} BPM</span>
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase text-[#94A3B8]">
                            Clave
                        </span>
                        <span className="text-xs font-bold text-[#E2E8F0]">
                            {CLEF_LABELS[clef]}
                        </span>
                    </div>
                </div>
            </div>

            {/* Botón de acción */}
            <button
                type="button"
                onClick={() => onSelect && onSelect(id)}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-blue-600/20 group-hover:bg-blue-600 border border-blue-500/40 text-xs font-bold text-blue-300 group-hover:text-[#F1F5F9] cursor-pointer transition-all flex items-center justify-center gap-2"
            >
                <span>Abrir Partitura</span>
                <span>→</span>
            </button>
        </article>
    );
}