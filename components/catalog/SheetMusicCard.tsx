import { ArrowRight, Heart, KeyboardMusic, Music2, Wind } from "lucide-react";
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
  emphasis?: boolean;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onSelect?: (id: string) => void;
}

const LEVEL_BADGE_STYLES: Record<DifficultyLevel, string> = {
  principiante:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-400/30",
  intermedio:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-400/30",
  avanzado:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-400/30",
};

const INSTRUMENT_ICONS: Record<InstrumentType, typeof KeyboardMusic> = {
  piano: KeyboardMusic,
  violin: Music2,
  flute: Wind,
};

const INSTRUMENT_NAMES: Record<InstrumentType, string> = {
  piano: "Piano",
  violin: "Violín",
  flute: "Flauta",
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
  emphasis = false,
  favorite = false,
  onToggleFavorite,
  onSelect,
}: SheetMusicCardProps) {
  const InstrumentIcon = INSTRUMENT_ICONS[instrument];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.7rem_2.4rem_1.5rem_2.2rem] border border-pink-200/80 bg-white/85 p-6 shadow-xl shadow-pink-200/25 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-300/35 dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 ${
        emphasis ? "md:p-7" : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-pink-200/60 blur-2xl transition group-hover:bg-pink-300/80 dark:bg-pink-500/10" />

      <div className={emphasis ? "md:grid md:grid-cols-[1.4fr_0.7fr] md:gap-6" : ""}>
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${LEVEL_BADGE_STYLES[level]}`}
            >
              {level}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[11px] font-semibold text-rose-800 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-100">
              <InstrumentIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {INSTRUMENT_NAMES[instrument]}
            </span>
            <span className="rounded-full border border-rose-200/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-100">
              {genre}
            </span>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(id)}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold ${
                  favorite
                    ? "border-transparent bg-gradient-to-r from-pink-400 to-rose-400 text-rose-950"
                    : "border-pink-200 bg-white/80 text-rose-700 dark:border-pink-500/25 dark:bg-slate-950/40 dark:text-pink-100"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-current" : ""}`} strokeWidth={1.75} />
                Favorita
              </button>
            )}
          </div>

          <h2 className="font-display text-3xl leading-tight text-rose-950 dark:text-pink-50">
            {title}
          </h2>
          <p className="mt-1 text-xs text-rose-900/55 dark:text-pink-100/50">
            {composer} • {measuresCount} compases
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-pink-100 bg-rose-50/60 p-3 text-center dark:border-pink-500/15 dark:bg-slate-950/40">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-rose-400">Compás</span>
              <span className="text-xs font-bold text-rose-950 dark:text-pink-50">{timeSignature}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-rose-400">Tempo</span>
              <span className="text-xs font-bold text-rose-950 dark:text-pink-50">{bpm} BPM</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-rose-400">Clave</span>
              <span className="text-xs font-bold text-rose-950 dark:text-pink-50">{CLEF_LABELS[clef]}</span>
            </div>
          </div>
        </div>

        {emphasis && (
          <div className="mt-5 flex items-end justify-between border-t border-pink-100 pt-4 dark:border-pink-500/15 md:mt-0 md:flex-col md:items-start md:justify-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">Tempo</span>
            <span className="font-display text-6xl leading-none text-rose-950 dark:text-pink-50">{bpm}</span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSelect && onSelect(id)}
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-pink-200 bg-pink-50/80 py-2.5 text-xs font-bold text-rose-800 transition group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-rose-400 group-hover:text-rose-950 dark:border-pink-500/25 dark:bg-pink-500/10 dark:text-pink-100"
      >
        <span>Abrir Partitura</span>
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </article>
  );
}
