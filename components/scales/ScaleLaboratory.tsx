"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import {
  SCALES,
  SCALE_FAMILY_FILTERS,
  scaleMatchesFamily,
  type MusicalScale,
  type ScaleDegree,
  type ScaleFamilyFilter,
  type ScaleLevel,
} from "@/data/scales";
import { getScaleProgress, getScales, saveScaleProgress, type ScaleProgressEntry } from "@/lib/sheetData";
import PianoKeyboard, { type PianoMark } from "@/components/scales/PianoKeyboard";
import ScaleStaff, { type ScaleRhythm } from "@/components/scales/ScaleStaff";

type Direction = "asc" | "desc" | "both";
type Hands = "rh" | "lh" | "both";

const RHYTHMS: { id: ScaleRhythm; label: string; divisions: number }[] = [
  { id: "quarter", label: "Negra", divisions: 1 },
  { id: "eighth", label: "Corcheas", divisions: 2 },
  { id: "triplet", label: "Tresillos", divisions: 3 },
  { id: "sixteenth", label: "Semicorcheas", divisions: 4 },
];

const LEVELS: { id: "todos" | ScaleLevel; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "principiante", label: "Principiante" },
  { id: "intermedio", label: "Intermedio" },
  { id: "avanzado", label: "Avanzado" },
];

function playableNotes(scale: MusicalScale, direction: Direction): ScaleDegree[] {
  if (direction === "asc") return scale.ascending;
  if (direction === "desc") return scale.descending;
  return [...scale.ascending, ...scale.descending.slice(1)];
}

function fingerLine(notes: ScaleDegree[], hand: "fingerRH" | "fingerLH"): string {
  return notes.map((note) => note[hand]).join("-");
}

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export default function ScaleLaboratory() {
  const [scales, setScales] = useState<MusicalScale[]>(SCALES);
  const [family, setFamily] = useState<ScaleFamilyFilter>("todas");
  const [level, setLevel] = useState<"todos" | ScaleLevel>("todos");
  const [accidentals, setAccidentals] = useState<"todas" | number>("todas");
  const [selectedId, setSelectedId] = useState("mayor-c");
  const [bpm, setBpm] = useState(72);
  const [rhythm, setRhythm] = useState<ScaleRhythm>("quarter");
  const [direction, setDirection] = useState<Direction>("asc");
  const [hands, setHands] = useState<Hands>("both");
  const [metroOn, setMetroOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [practiceOn, setPracticeOn] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [progress, setProgress] = useState<Record<string, ScaleProgressEntry>>({});
  const [metroFlash, setMetroFlash] = useState(false);

  const timersRef = useRef<number[]>([]);
  const metroTimerRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const metroOnRef = useRef(metroOn);
  metroOnRef.current = metroOn;

  const filtered = useMemo(
    () =>
      scales.filter((scale) => {
        if (!scaleMatchesFamily(scale, family)) return false;
        if (level !== "todos" && scale.level !== level) return false;
        if (accidentals !== "todas" && scale.accidentals !== accidentals) return false;
        return true;
      }),
    [scales, family, level, accidentals],
  );

  const scale = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  const notes = scale ? playableNotes(scale, direction) : [];
  const rhythmSpec = RHYTHMS.find((item) => item.id === rhythm) ?? RHYTHMS[0];
  const shownIndex = playing ? activeIndex : practiceOn ? practiceIndex : null;

  useEffect(() => {
    let active = true;
    getScales()
      .then((rows) => {
        if (active && rows.length) setScales(rows);
      })
      .catch((error) => console.error("No se pudieron cargar las escalas:", error));
    getScaleProgress()
      .then((rows) => {
        if (active) setProgress(rows);
      })
      .catch((error) => console.error("No se pudo leer el progreso de escalas:", error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!filtered.some((item) => item.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? "");
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    setPracticeIndex(0);
    setActiveIndex(null);
  }, [scale?.id, direction]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const ensureCtx = async () => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  };

  const scheduleClick = (ctx: AudioContext, time: number, accent: boolean) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = accent ? 1200 : 820;
    gain.gain.setValueAtTime(accent ? 0.18 : 0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.03);
  };

  const scheduleTone = (ctx: AudioContext, midi: number, time: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = midiToFreq(midi);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
  };

  const stopMetronome = () => {
    if (metroTimerRef.current !== null) {
      window.clearInterval(metroTimerRef.current);
      metroTimerRef.current = null;
    }
    setMetroFlash(false);
  };

  const startMetronome = async (isCancelled: () => boolean) => {
    stopMetronome();
    const ctx = await ensureCtx();
    if (isCancelled()) return;
    const step = 60 / bpm / rhythmSpec.divisions;
    let count = 0;
    let next = ctx.currentTime + 0.05;
    metroTimerRef.current = window.setInterval(() => {
      const horizon = ctx.currentTime + 0.2;
      while (next < horizon) {
        const accent = count % rhythmSpec.divisions === 0;
        scheduleClick(ctx, next, accent);
        const delay = Math.max(0, (next - ctx.currentTime) * 1000);
        window.setTimeout(() => setMetroFlash(accent), delay);
        next += step;
        count += 1;
      }
    }, 50);
  };

  useEffect(() => {
    if (!metroOn || playing) {
      stopMetronome();
      return;
    }
    let cancelled = false;
    startMetronome(() => cancelled).catch((error) => console.error(error));
    return () => {
      cancelled = true;
      stopMetronome();
    };
    // El metrónomo se rearma cuando cambia el tempo o la subdivisión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metroOn, bpm, rhythm, playing]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopMetronome();
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const playScale = async () => {
    if (!scale || playing) return;
    clearTimers();
    setPlaying(true);
    const ctx = await ensureCtx();
    const step = 60 / bpm / rhythmSpec.divisions;
    const withClick = metroOnRef.current;
    notes.forEach((note, index) => {
      const time = ctx.currentTime + 0.08 + index * step;
      const midis = hands === "lh" ? [note.midi - 12] : hands === "rh" ? [note.midi] : [note.midi, note.midi - 12];
      midis.forEach((midi) => scheduleTone(ctx, midi, time, Math.max(0.08, step * 0.92)));
      if (withClick) scheduleClick(ctx, time, index % rhythmSpec.divisions === 0);
      const timer = window.setTimeout(() => setActiveIndex(index), index * step * 1000);
      timersRef.current.push(timer);
    });
    const end = window.setTimeout(() => {
      setPlaying(false);
      setActiveIndex(null);
    }, notes.length * step * 1000 + 80);
    timersRef.current.push(end);
  };

  const stopPlayback = () => {
    clearTimers();
    setPlaying(false);
    setActiveIndex(null);
  };

  const playCurrentNote = async () => {
    if (!scale) return;
    const note = notes[practiceIndex];
    if (!note) return;
    const ctx = await ensureCtx();
    const midis = hands === "lh" ? [note.midi - 12] : hands === "rh" ? [note.midi] : [note.midi, note.midi - 12];
    midis.forEach((midi) => scheduleTone(ctx, midi, ctx.currentTime + 0.02, 0.55));
    setActiveIndex(practiceIndex);
  };

  const markMastered = async () => {
    if (!scale) return;
    const mastered = !progress[scale.id]?.mastered;
    await saveScaleProgress(scale.id, bpm, mastered);
    setProgress(await getScaleProgress());
  };

  const marks: PianoMark[] = [];
  if (scale) {
    const rank = { idle: 1, passed: 2, active: 3 };
    const byMidi = new Map<number, PianoMark>();
    notes.forEach((note, index) => {
      const state: PianoMark["state"] =
        shownIndex === null ? "idle" : index < shownIndex ? "passed" : index === shownIndex ? "active" : "idle";
      const put = (midi: number, finger?: number) => {
        const previous = byMidi.get(midi);
        if (!previous || rank[state] >= rank[previous.state]) {
          byMidi.set(midi, { midi, finger, state });
        }
      };
      if (hands !== "lh") put(note.midi, note.fingerRH);
      if (hands !== "rh") put(note.midi - 12, note.fingerLH);
    });
    marks.push(...byMidi.values());
  }

  const pill = (active: boolean) =>
    `cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active
        ? "bg-gradient-to-r from-pink-400 to-rose-400 text-rose-950 shadow-md shadow-pink-300/40"
        : "border border-pink-200/80 bg-white/70 text-rose-900 hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
    }`;

  return (
    <div className="flex flex-col gap-4">
      <header className="studio-rise rounded-[2rem_2.5rem_1.6rem_2rem] border border-pink-200/80 bg-white/85 p-7 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-400">Hanon · Czerny · ABRSM · Berklee</p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-rose-950 dark:text-pink-50 md:text-5xl">
          Laboratorio de Escalas
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-rose-900/65 dark:text-pink-100/60">
          Practica las tonalidades del círculo de quintas, las menores, las pentatónicas, el blues y los modos con digitación de conservatorio, pentagrama a dos claves y metrónomo.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <aside className="flex flex-col gap-3 lg:sticky lg:top-4 lg:col-span-3 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <section className="rounded-[1.6rem] border border-pink-200/80 bg-white/85 p-4 shadow-lg shadow-pink-200/25 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/30">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">Tipo</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SCALE_FAMILY_FILTERS.map((item) => (
                <button key={item.id} type="button" onClick={() => setFamily(item.id)} className={pill(family === item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">Nivel</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {LEVELS.map((item) => (
                <button key={item.id} type="button" onClick={() => setLevel(item.id)} className={pill(level === item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">Alteraciones</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setAccidentals("todas")} className={pill(accidentals === "todas")}>
                Todas
              </button>
              {[0, 1, 2, 3, 4, 5, 6].map((count) => (
                <button key={count} type="button" onClick={() => setAccidentals(count)} className={pill(accidentals === count)}>
                  {count === 0 ? "0" : count}
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 && (
              <p className="rounded-2xl border border-pink-200/80 bg-white/70 px-4 py-6 text-sm text-rose-900/70 dark:border-pink-500/20 dark:bg-slate-900/70 dark:text-pink-100/70">
                Ninguna escala coincide con estos filtros.
              </p>
            )}
            {filtered.map((item) => {
              const active = item.id === scale?.id;
              const mastered = progress[item.id]?.mastered;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`cursor-pointer rounded-[1.2rem] border px-4 py-3 text-left transition ${
                    active
                      ? "border-transparent bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950 shadow-lg shadow-pink-300/40"
                      : "border-pink-200/80 bg-white/75 text-rose-950 dark:border-pink-500/20 dark:bg-slate-900/75 dark:text-pink-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-lg leading-tight">{item.name}</span>
                    {mastered && <Check className="h-4 w-4 shrink-0" />}
                  </div>
                  <p className={`mt-1 text-[11px] font-semibold ${active ? "text-rose-950/70" : "text-rose-400"}`}>
                    {item.familyLabel} · {item.signature} · {item.level}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {scale && (
          <section className="flex flex-col gap-4 rounded-[2rem] border border-pink-200/80 bg-white/85 p-5 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80 dark:shadow-black/40 md:p-6 lg:col-span-9">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-400">{scale.familyLabel}</p>
                <h2 className="mt-1 font-display text-3xl text-rose-950 dark:text-pink-50">{scale.name}</h2>
                <p className="mt-2 text-sm text-rose-900/70 dark:text-pink-100/70">{scale.formula}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-rose-800 dark:bg-pink-500/15 dark:text-pink-100">
                  {scale.signature}
                </span>
                <span className="rounded-full border border-pink-200 px-3 py-1 text-xs font-bold capitalize text-rose-800 dark:border-pink-500/25 dark:text-pink-100">
                  {scale.level}
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-rose-500 dark:text-pink-300">{scale.reference}</p>

            <div className="grid gap-2 text-sm text-rose-950 dark:text-pink-50 sm:grid-cols-2">
              <p className="rounded-2xl bg-rose-50/80 px-3 py-2 dark:bg-slate-950/40">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">MD sube</span>
                <span className="mt-1 block font-mono text-xs">{scale.fingeringRH}</span>
              </p>
              <p className="rounded-2xl bg-rose-50/80 px-3 py-2 dark:bg-slate-950/40">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">MI sube</span>
                <span className="mt-1 block font-mono text-xs">{scale.fingeringLH}</span>
              </p>
              <p className="rounded-2xl bg-rose-50/80 px-3 py-2 dark:bg-slate-950/40">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">MD baja</span>
                <span className="mt-1 block font-mono text-xs">{fingerLine(scale.descending, "fingerRH")}</span>
              </p>
              <p className="rounded-2xl bg-rose-50/80 px-3 py-2 dark:bg-slate-950/40">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">MI baja</span>
                <span className="mt-1 block font-mono text-xs">{fingerLine(scale.descending, "fingerLH")}</span>
              </p>
            </div>

            <p className="text-xs leading-relaxed text-rose-900/65 dark:text-pink-100/60">
              Sube: {scale.ascending.map((note) => note.name).join(" · ")}
              <br />
              Baja: {scale.descending.map((note) => note.name).join(" · ")}
            </p>

            <ScaleStaff scale={scale} direction={direction} rhythm={rhythm} activeIndex={shownIndex} />
            <PianoKeyboard marks={marks} />

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 dark:text-pink-100">
                {bpm} BPM
                <input
                  type="range"
                  min={40}
                  max={180}
                  value={bpm}
                  aria-label="Tempo en BPM"
                  onChange={(event) => setBpm(Number(event.target.value))}
                  className="accent-rose-400"
                />
              </label>
              <button
                type="button"
                onClick={() => setMetroOn((value) => !value)}
                className={pill(metroOn)}
              >
                <span className={`mr-1 inline-block h-2 w-2 rounded-full ${metroFlash ? "bg-rose-950" : "bg-rose-300"}`} />
                Metrónomo
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {RHYTHMS.map((item) => (
                <button key={item.id} type="button" onClick={() => setRhythm(item.id)} className={pill(rhythm === item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["asc", "Subir"],
                  ["desc", "Bajar"],
                  ["both", "Ida y vuelta"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setDirection(id)} className={pill(direction === id)}>
                  {label}
                </button>
              ))}
              {(
                [
                  ["rh", "MD"],
                  ["lh", "MI"],
                  ["both", "Juntas"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setHands(id)} className={pill(hands === id)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={playing ? stopPlayback : playScale}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 text-xs font-bold text-rose-950 shadow-md shadow-pink-300/40"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                {playing ? "Detener" : "Escuchar escala"}
              </button>
              <button type="button" onClick={() => setPracticeOn((value) => !value)} className={pill(practiceOn)}>
                Modo práctica
              </button>
              <button
                type="button"
                onClick={markMastered}
                className={pill(Boolean(progress[scale.id]?.mastered))}
              >
                <Check className="mr-1 inline h-3.5 w-3.5" />
                {progress[scale.id]?.mastered ? "Dominada" : "Marcar como dominada"}
              </button>
            </div>

            {practiceOn && (
              <div className="rounded-[1.4rem] border border-pink-100 bg-rose-50/70 p-4 dark:border-pink-500/15 dark:bg-slate-950/40">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
                  Nota {Math.min(practiceIndex + 1, notes.length)} de {notes.length}
                </p>
                <p className="mt-1 font-display text-4xl text-rose-950 dark:text-pink-50">
                  {notes[practiceIndex]?.name ?? "—"}
                </p>
                <p className="mt-1 text-xs text-rose-800 dark:text-pink-100">
                  MD {notes[practiceIndex]?.fingerRH ?? "–"} · MI {notes[practiceIndex]?.fingerLH ?? "–"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPracticeIndex((index) => Math.max(0, index - 1))}
                    className={pill(false)}
                  >
                    <SkipBack className="mr-1 inline h-3.5 w-3.5" />
                    Anterior
                  </button>
                  <button type="button" onClick={playCurrentNote} className={pill(false)}>
                    Escuchar nota
                  </button>
                  <button
                    type="button"
                    onClick={() => setPracticeIndex((index) => Math.min(notes.length - 1, index + 1))}
                    className={pill(false)}
                  >
                    Siguiente
                    <SkipForward className="ml-1 inline h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {notes.map((note, index) => (
                    <button
                      key={`${note.pitch}-${index}`}
                      type="button"
                      onClick={() => setPracticeIndex(index)}
                      className={`h-2.5 w-2.5 cursor-pointer rounded-full ${
                        index === practiceIndex ? "bg-rose-500" : index < practiceIndex ? "bg-emerald-400" : "bg-pink-200"
                      }`}
                      aria-label={note.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
