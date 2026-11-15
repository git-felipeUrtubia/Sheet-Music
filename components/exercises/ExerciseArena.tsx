// components/exercises/ExerciseArena.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Vex from "vexflow";
import { EXERCISES_DATA } from "@/data/exercises";
import { useMidiInput } from "@/hooks/useMidiInput";
import { getExercisesByLevel, getProgress, saveExerciseProgress } from "@/lib/sheetData";
import { DifficultyLevel } from "@/types/exercise";
import { loadAppSettings, formatNoteBySystem, AppSettings } from "@/types/settings";

interface ExerciseArenaProps {
    onBack: (level: null) => void;
    level: DifficultyLevel;
}

export default function ExerciseArena({ onBack, level }: ExerciseArenaProps) {
    const [exerciseInPlay, setExerciseInPlay] = useState(0);
    const [maxUnlockedExercise, setMaxUnlockedExercise] = useState(0);
    const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);

    const [appSettings, setAppSettings] = useState<AppSettings>(() => loadAppSettings());

    // Estados del Metrónomo, Aguja y Ancho Dinámico del Pentagrama
    const [bpm, setBpm] = useState<number>(70);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [beatStep, setBeatStep] = useState<number>(0);

    // Conexión WebMIDI instantánea
    const { detectedMidi, noteHitId, isConnected } = useMidiInput();

    const [statusMessage, setStatusMessage] = useState<string>(
        !isConnected ? "Conecta un instrumento MIDI USB para iniciar" : "Presiona Play para iniciar"
    );
    const [cursorX, setCursorX] = useState<number>(80);
    const [cursorTransitionMs, setCursorTransitionMs] = useState<number>(0);
    const [staveWidth, setStaveWidth] = useState<number>(700);

    // Referencias
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const metroAudioCtxRef = useRef<AudioContext | null>(null);
    const beatStartTimeRef = useRef<number>(0);

    const currentNoteIndexRef = useRef<number>(0);
    currentNoteIndexRef.current = currentNoteIndex;

    const lastMatchedHitIdRef = useRef<number>(-1);

    const [exercisesDataFiltered, setExercisesDataFiltered] = useState(() =>
        EXERCISES_DATA.filter((it) => it.level === level)
    );

    useEffect(() => {
        let active = true;
        const fallback = EXERCISES_DATA.filter((item) => item.level === level);
        setExercisesDataFiltered(fallback);
        setExerciseInPlay(0);

        (async () => {
            try {
                const rows = await getExercisesByLevel(level);
                if (!active) return;
                const list = rows.length > 0 ? rows : fallback;
                setExercisesDataFiltered(list);

                const progress = await getProgress();
                if (!active) return;
                let unlocked = 0;
                list.forEach((exercise, index) => {
                    if (progress.entries[exercise.id]?.completed) {
                        unlocked = Math.max(unlocked, index + 1);
                    }
                });
                setMaxUnlockedExercise(Math.min(unlocked, Math.max(0, list.length - 1)));
            } catch (error) {
                console.error("No se pudieron cargar los ejercicios:", error);
            }
        })();

        return () => {
            active = false;
        };
    }, [level]);

    useEffect(() => {
        const exercise = exercisesDataFiltered[exerciseInPlay];
        if (!exercise || currentNoteIndex < exercise.notes.length) return;
        saveExerciseProgress(exercise.id, bpm).catch((error) => {
            console.error("No se pudo guardar el progreso:", error);
        });
    }, [bpm, currentNoteIndex, exerciseInPlay, exercisesDataFiltered]);

    const currentExercise = exercisesDataFiltered[exerciseInPlay];

    const isExerciseFinished = currentNoteIndex >= currentExercise.notes.length;
    const isLastExercise = exerciseInPlay === exercisesDataFiltered.length - 1;
    const isLessonFinished = isExerciseFinished && isLastExercise;

    const canGoPrev = exerciseInPlay > 0;
    const canGoNext = isExerciseFinished || exerciseInPlay < maxUnlockedExercise;

    const resetScrollToStart = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        }
    }, []);

    // Escuchar cambios en Ajustes o estado MIDI USB
    useEffect(() => {
        const handleSettingsUpdate = () => {
            setAppSettings(loadAppSettings());
        };
        window.addEventListener("app-settings-updated", handleSettingsUpdate);

        if (!isConnected) {
            setIsPlaying(false);
            setBeatStep(0);
            setCursorTransitionMs(0);
            resetScrollToStart();
            setStatusMessage("Sin conexión MIDI • Conecta tu instrumento por USB");
        } else if (!isPlaying) {
            setStatusMessage("Presiona Play para iniciar");
        }

        return () => window.removeEventListener("app-settings-updated", handleSettingsUpdate);
    }, [isConnected, isPlaying, resetScrollToStart]);

    // 1. Generador de sonido "Clic" del metrónomo
    const playMetronomeClick = useCallback((isStrongBeat: boolean) => {
        try {
            if (!metroAudioCtxRef.current) {
                metroAudioCtxRef.current = new AudioContext();
            }
            const ctx = metroAudioCtxRef.current;
            if (ctx.state === "suspended") ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.frequency.value = isStrongBeat ? 1000 : 750;
            const { metronomeVolume } = loadAppSettings();
            if (metronomeVolume <= 0) return;

            const volumeGain = (metronomeVolume / 100) * 0.5;
            gain.gain.setValueAtTime(volumeGain, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) {
            console.error("Error en audio del metrónomo:", e);
        }
    }, []);

    // 2. Botón Play / Detener
    const handleTogglePlay = () => {
        if (!isConnected) return;

        setCursorTransitionMs(0);
        resetScrollToStart();

        if (isPlaying) {
            setIsPlaying(false);
            setCurrentNoteIndex(0);
            currentNoteIndexRef.current = 0;
            lastMatchedHitIdRef.current = -1;
            setBeatStep(0);
            setStatusMessage("Detenido");
        } else {
            setCurrentNoteIndex(0);
            currentNoteIndexRef.current = 0;
            lastMatchedHitIdRef.current = -1;
            setBeatStep(-4);
            setIsPlaying(true);
            setStatusMessage("Prepárate: 4...");
        }
    };

    // 3. Reloj del Metrónomo + Aguja + Auto-Scroll
    useEffect(() => {
        if (!isPlaying) return;

        const quarterBeatMs = (60 / bpm) * 1000;

        const getDurationInBeats = (duration: string) => {
            if (duration === "w") return 4;
            if (duration === "h") return 2;
            if (duration === "8") return 0.5;
            if (duration === "16") return 0.25;
            return 1;
        };

        const currentNoteBeats =
            beatStep >= 0 && currentExercise.notes[beatStep]
                ? getDurationInBeats(currentExercise.notes[beatStep].duration)
                : 1;
        const stepDurationMs = quarterBeatMs * currentNoteBeats;

        let accumulatedBeats = 0;
        if (beatStep < 0) {
            accumulatedBeats = beatStep;
        } else {
            for (let i = 0; i < beatStep; i++) {
                accumulatedBeats += getDurationInBeats(currentExercise.notes[i].duration);
            }
        }

        beatStartTimeRef.current = performance.now();

        const isExactBeat = Math.abs(accumulatedBeats % 1) < 0.001;
        if (isExactBeat) {
            playMetronomeClick(accumulatedBeats === -4 || accumulatedBeats === 0);
        }

        const extraClickTimers: NodeJS.Timeout[] = [];
        if (currentNoteBeats > 1) {
            for (let b = 1; b < currentNoteBeats; b++) {
                const timer = setTimeout(() => {
                    playMetronomeClick(false);
                }, b * quarterBeatMs);
                extraClickTimers.push(timer);
            }
        }

        let raf1: number | null = null;
        let raf2: number | null = null;

        if (beatStep < 0) {
            setStatusMessage(`Prepárate: ${Math.abs(beatStep)}...`);
            setCursorTransitionMs(0);
        } else if (beatStep < currentExercise.notes.length) {
            const currentMeasureBeat = (Math.floor(accumulatedBeats) % 4) + 1;
            setStatusMessage(
                `Pulso ${currentMeasureBeat} • Nota ${beatStep + 1} de ${currentExercise.notes.length}`
            );

            // AUTO-SCROLL
            const scrollEl = scrollContainerRef.current;
            if (scrollEl) {
                // Cálculo estimado basado en el ancho de VexFlow
                const currentX = (beatStep / currentExercise.notes.length) * staveWidth;
                const halfViewport = scrollEl.clientWidth / 2;
                if (currentX > halfViewport) {
                    scrollEl.scrollTo({
                        left: currentX - halfViewport,
                        behavior: "smooth",
                    });
                }
            }

            setCursorTransitionMs(stepDurationMs);
            const targetWidth = ((beatStep + 1) / currentExercise.notes.length) * staveWidth;
            setCursorX(targetWidth);
        }

        const beatTimeoutId = setTimeout(() => {
            if (beatStep + 1 < currentExercise.notes.length) {
                setBeatStep((prev) => prev + 1);
            } else {
                setIsPlaying(false);
                setCursorTransitionMs(0);
                if (currentNoteIndexRef.current >= currentExercise.notes.length) {
                    setStatusMessage("¡Ejercicio superado!");
                    setMaxUnlockedExercise((prev) => Math.max(prev, exerciseInPlay + 1));
                } else {
                    setStatusMessage(
                        "Recorrido finalizado • Puedes seguir intentando o reiniciar el ejercicio"
                    );
                }
            }
        }, stepDurationMs);

        return () => {
            clearTimeout(beatTimeoutId);
            extraClickTimers.forEach(clearTimeout);
            if (raf1 !== null) cancelAnimationFrame(raf1);
            if (raf2 !== null) cancelAnimationFrame(raf2);
        };
    }, [isPlaying, beatStep, bpm, currentExercise, exerciseInPlay, staveWidth, playMetronomeClick]);

    // 4. Validación de notas MIDI exacta (Cero latencia, candado por pulsación)
    useEffect(() => {
        if (!isPlaying || beatStep < 0 || detectedMidi === null) return;
        if (currentNoteIndex >= currentExercise.notes.length) return;
        if (currentNoteIndex > beatStep) return;

        const targetNote = currentExercise.notes[currentNoteIndex];

        if (detectedMidi === targetNote.midiNote) {
            // El candado es exacto: el noteHitId cambia por cada orden física enviada por el piano USB
            if (noteHitId === lastMatchedHitIdRef.current) return;

            lastMatchedHitIdRef.current = noteHitId;

            const nextIdx = currentNoteIndex + 1;
            currentNoteIndexRef.current = nextIdx;
            setCurrentNoteIndex(nextIdx);

            if (nextIdx >= currentExercise.notes.length) {
                setMaxUnlockedExercise((prev) => Math.max(prev, exerciseInPlay + 1));
            }
        }
    }, [detectedMidi, noteHitId, beatStep, isPlaying, currentNoteIndex, currentExercise, exerciseInPlay]);

    // 5. Dibujado del Pentagrama con VexFlow (Multi-compás y ancho dinámico)
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, BarNote, Accidental } =
            (Vex as any).Flow || Vex;

        container.innerHTML = "";

        const getBeats = (dur: string) =>
            dur === "w" ? 4 : dur === "h" ? 2 : dur === "8" ? 0.5 : dur === "16" ? 0.25 : 1;

        const beatsPerMeasure = parseInt(currentExercise.timeSignature.split("/")[0], 10) || 4;

        const tickables: any[] = [];
        const onlyStaveNotes: any[] = [];
        let accBeats = 0;

        currentExercise.notes.forEach((noteItem, index) => {
            if (index > 0 && Math.abs(accBeats % beatsPerMeasure) < 0.001) {
                tickables.push(new BarNote());
            }

            const staveNote = new StaveNote({
                clef: currentExercise.clef,
                keys: [noteItem.pitch],
                duration: noteItem.duration,
            });

            const keyName = noteItem.pitch.split("/")[0];
            if (keyName.length > 1) {
                const accSymbol = keyName.slice(1);
                staveNote.addModifier(new Accidental(accSymbol), 0);
            }

            if (index < currentNoteIndex) {
                staveNote.setStyle({ fillStyle: "#10B981", strokeStyle: "#10B981" });
            } else if (index === currentNoteIndex) {
                staveNote.setStyle({ fillStyle: "#2563EB", strokeStyle: "#2563EB" });
            }

            tickables.push(staveNote);
            onlyStaveNotes.push(staveNote);
            accBeats += getBeats(noteItem.duration);
        });

        const dynamicWidth = Math.max(700, onlyStaveNotes.length * 55 + 140);
        setStaveWidth(dynamicWidth);

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(dynamicWidth, 180);
        const context = renderer.getContext();

        const stave = new Stave(10, 30, dynamicWidth - 20);
        stave.addClef(currentExercise.clef).addTimeSignature(currentExercise.timeSignature);
        stave.setContext(context).draw();

        const voice = new Voice({ numBeats: Math.ceil(accBeats), beatValue: 4 });
        voice.setStrict(false);
        voice.addTickables(tickables);

        new Formatter().joinVoices([voice]).format([voice], dynamicWidth - 120);
        const beams = Beam.generateBeams(onlyStaveNotes);
        voice.draw(context, stave);
        beams.forEach((beam: any) => beam.setContext(context).draw());

        if (!isPlaying) {
            setCursorTransitionMs(0);
            setCursorX(80);
        }
    }, [currentExercise, currentNoteIndex, isPlaying]);

    return (
        <section className="studio-fade mx-auto flex w-full max-w-5xl flex-col">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        className="cursor-pointer rounded-full border border-pink-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-rose-950 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-pink-500/20 dark:bg-slate-900/80 dark:text-pink-50"
                        onClick={() => {
                            setIsPlaying(false);
                            onBack(null);
                        }}
                    >
                        ← Cambiar nivel
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="font-display text-3xl leading-none text-rose-950 dark:text-pink-50">
                                {currentExercise.title}
                            </h1>
                            <span className="rounded-full border border-pink-200 bg-pink-100 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-800 dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-100">
                                Nivel {level[0].toLocaleUpperCase() + level.slice(1)}
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-rose-900/60 dark:text-pink-100/55">
                            Toca cada nota en tu teclado MIDI al ritmo de la aguja
                        </p>
                    </div>
                </div>
            </header>

            {!isConnected && (
                <div className="mt-5 flex items-center gap-3 rounded-[1.4rem] border border-rose-200 bg-rose-50/90 px-5 py-4 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-100">
                    <span className="text-lg">🎹</span>
                    <div>
                        <p className="text-sm font-semibold">No se detectó un teclado MIDI</p>
                        <p className="text-xs opacity-80">
                            Conecta tu instrumento por cable USB a la computadora para comenzar la práctica interactiva.
                        </p>
                    </div>
                </div>
            )}

            <div className="relative mt-6 rounded-[2rem] border border-pink-200/70 bg-[radial-gradient(circle_at_top,rgba(255,228,236,0.95),rgba(255,248,250,0.4))] p-3 shadow-xl shadow-pink-200/30 dark:border-pink-500/20 dark:bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.16),rgba(11,13,23,0.4))] dark:shadow-black/40 md:p-5">
                <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-400">
                    <span>Compás {currentExercise.timeSignature}</span>
                    <span>
                        Progreso: {currentNoteIndex} / {currentExercise.notes.length} Notas
                    </span>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="flex w-full items-center justify-start overflow-x-auto scroll-smooth rounded-[1.45rem] border border-white/80 bg-[#FFFDFB] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                >
                    <div
                        style={{ width: `${staveWidth}px` }}
                        className="relative mx-auto flex min-h-[180px] shrink-0 items-center justify-start"
                    >
                        <div
                            style={{
                                transform: `translateX(${cursorX}px)`,
                                transition:
                                    isPlaying && beatStep >= 0 && cursorTransitionMs > 0
                                        ? `transform ${cursorTransitionMs}ms linear`
                                        : "none",
                            }}
                            className={`pointer-events-none absolute bottom-5 left-0 top-5 z-10 w-[2.5px] rounded-full ${
                                beatStep < 0 && isPlaying ? "bg-rose-300/70" : "bg-rose-500/80"
                            }`}
                        />

                        <div
                            ref={containerRef}
                            style={{ width: `${staveWidth}px` }}
                            className="h-[180px]"
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-center">
                    <span className="rounded-full border border-pink-200 bg-white/85 px-4 py-1.5 text-xs font-bold text-rose-800 dark:border-pink-500/30 dark:bg-slate-950/60 dark:text-pink-100">
                        {currentExercise.notes[currentNoteIndex]
                            ? `Nota objetivo: ${formatNoteBySystem(
                                currentExercise.notes[currentNoteIndex].pitch,
                                appSettings.notation
                            )}`
                            : "¡Ejercicio completado!"}
                    </span>
                </div>

                <div className="sticky bottom-24 z-20 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] border border-pink-200/80 bg-white/92 px-4 py-3 shadow-xl shadow-pink-200/30 backdrop-blur-xl dark:border-pink-500/25 dark:bg-slate-900/92 dark:shadow-black/40 md:bottom-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-400">
                                Metrónomo
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-display text-3xl leading-none text-rose-950 dark:text-pink-50">
                                    {bpm}
                                </span>
                                <span className="text-xs font-semibold text-rose-400">BPM</span>
                            </div>
                        </div>

                        <input
                            type="range"
                            min={40}
                            max={140}
                            step={5}
                            value={bpm}
                            disabled={isPlaying || !isConnected}
                            onChange={(e) => setBpm(Number(e.target.value))}
                            className="w-32 cursor-pointer accent-rose-400 disabled:opacity-50 md:w-44"
                        />
                    </div>

                    <span
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-bold ${
                            !isConnected
                                ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200"
                                : beatStep < 0 && isPlaying
                                    ? "animate-pulse border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200"
                                    : isExerciseFinished
                                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                                        : "border-pink-200 bg-pink-50 text-rose-800 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-100"
                        }`}
                    >
                        {statusMessage}
                    </span>

                    <button
                        type="button"
                        disabled={!isConnected}
                        onClick={handleTogglePlay}
                        className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition ${
                            !isConnected
                                ? "cursor-not-allowed bg-slate-200 text-slate-400 opacity-60 shadow-none dark:bg-slate-800 dark:text-slate-500"
                                : isPlaying
                                    ? "cursor-pointer bg-rose-950 text-pink-50 active:scale-95"
                                    : "cursor-pointer bg-gradient-to-r from-pink-400 to-rose-400 text-rose-950 shadow-pink-300/40 active:scale-95"
                        }`}
                    >
                        <span>{isPlaying ? "■" : "▶"}</span>
                        <span>
                            {!isConnected ? "Sin Conexión" : isPlaying ? "Detener" : "Play Metrónomo"}
                        </span>
                    </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-pink-200/70 pt-4 dark:border-pink-500/15">
                    <button
                        type="button"
                        disabled={!isConnected}
                        className="cursor-pointer rounded-full border border-pink-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-rose-950 transition disabled:pointer-events-none disabled:opacity-40 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
                        onClick={() => {
                            setIsPlaying(false);
                            setCurrentNoteIndex(0);
                            currentNoteIndexRef.current = 0;
                            lastMatchedHitIdRef.current = -1;
                            setBeatStep(0);
                            setCursorTransitionMs(0);
                            resetScrollToStart();
                            setStatusMessage("Reiniciado");
                        }}
                    >
                        ↺ Reiniciar ejercicio
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={!canGoPrev}
                            className="cursor-pointer rounded-full border border-pink-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-rose-800 transition disabled:pointer-events-none disabled:opacity-40 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-100"
                            onClick={() => {
                                if (canGoPrev) {
                                    setIsPlaying(false);
                                    setCursorTransitionMs(0);
                                    resetScrollToStart();
                                    setExerciseInPlay((prev) => prev - 1);
                                    setCurrentNoteIndex(0);
                                    currentNoteIndexRef.current = 0;
                                    lastMatchedHitIdRef.current = -1;
                                    setBeatStep(0);
                                    setStatusMessage(
                                        isConnected
                                            ? "Presiona Play para iniciar"
                                            : "Conecta tu instrumento MIDI para iniciar"
                                    );
                                }
                            }}
                        >
                            ← Anterior
                        </button>

                        <span className="px-2 text-xs font-semibold text-rose-900/50 dark:text-pink-100/50">
                            {exerciseInPlay + 1} / {exercisesDataFiltered.length}
                        </span>

                        <button
                            type="button"
                            disabled={!canGoNext}
                            className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-2.5 text-sm font-bold text-rose-950 shadow-lg shadow-pink-300/40 transition disabled:pointer-events-none disabled:bg-slate-300 disabled:bg-none disabled:text-slate-500 disabled:opacity-50 disabled:shadow-none"
                            onClick={() => {
                                if (!isLastExercise && canGoNext) {
                                    setIsPlaying(false);
                                    setCursorTransitionMs(0);
                                    resetScrollToStart();
                                    setExerciseInPlay((prev) => prev + 1);
                                    setCurrentNoteIndex(0);
                                    currentNoteIndexRef.current = 0;
                                    lastMatchedHitIdRef.current = -1;
                                    setBeatStep(0);
                                    setStatusMessage(
                                        isConnected
                                            ? "Presiona Play para iniciar"
                                            : "Conecta tu instrumento MIDI para iniciar"
                                    );
                                } else if (isLessonFinished) {
                                    setIsPlaying(false);
                                    onBack(null);
                                }
                            }}
                        >
                            {isLessonFinished ? "Finalizar Lección ✓" : "Siguiente →"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}