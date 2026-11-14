// components/exercises/ExerciseArena.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Vex from "vexflow";
import { EXERCISES_DATA } from "@/data/exercises";
import { useMidiInput } from "@/hooks/useMidiInput";
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
        if (typeof window !== "undefined" && window.electronDB) {
            window.electronDB.getExercisesByLevel(level).then((rows) => {
                if (rows && rows.length > 0) {
                    setExercisesDataFiltered(rows);
                    setExerciseInPlay(0);
                }
            });
        }
    }, [level]);

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
        <section className="w-full max-w-5xl mx-auto flex flex-col justify-between select-none">
            {/* Barra superior */}
            <header className="w-full flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-900/50">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="px-3.5 py-2 rounded-lg bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-blue-300 cursor-pointer transition-colors"
                        onClick={() => {
                            setIsPlaying(false);
                            onBack(null);
                        }}
                    >
                        ← Cambiar nivel
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[#F1F5F9]">
                            {currentExercise.title} • Nivel{" "}
                            {level[0].toLocaleUpperCase() + level.slice(1)}
                        </h1>
                        <p className="text-xs text-[#94A3B8]">
                            Toca cada nota en tu teclado MIDI al ritmo de la aguja
                        </p>
                    </div>
                </div>
            </header>

            {/* Alerta cuando no hay instrumento MIDI conectado */}
            {!isConnected && (
                <div className="w-full mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between gap-4 text-rose-300">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">🎹</span>
                        <div>
                            <p className="text-xs md:text-sm font-bold text-rose-200">
                                No se detectó un teclado MIDI
                            </p>
                            <p className="text-xs text-rose-300/90">
                                Conecta tu instrumento por cable USB a la computadora para comenzar la práctica interactiva.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tarjeta Central */}
            <div className="w-full bg-[#111C3D] border-2 border-blue-900/60 rounded-2xl p-6 md:p-8 shadow-2xl my-8">

                {/* Panel de Metrónomo y Botón Play */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-[#0A1128] border border-blue-900/60">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                                Metrónomo
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xl font-extrabold font-mono text-[#F1F5F9]">
                                    {bpm}
                                </span>
                                <span className="text-xs text-blue-400 font-semibold">BPM</span>
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
                            className="w-32 md:w-44 accent-blue-500 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${!isConnected
                                ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                                : beatStep < 0 && isPlaying
                                    ? "bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse"
                                    : isExerciseFinished
                                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                        : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                                }`}
                        >
                            {statusMessage}
                        </span>
                    </div>

                    <button
                        type="button"
                        disabled={!isConnected}
                        onClick={handleTogglePlay}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#F1F5F9] shadow-lg transition-all ${!isConnected
                            ? "bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed shadow-none"
                            : isPlaying
                                ? "bg-rose-600 hover:bg-rose-500 cursor-pointer active:scale-95"
                                : "bg-emerald-600 hover:bg-emerald-500 cursor-pointer active:scale-95"
                            }`}
                    >
                        <span>{isPlaying ? "■" : "▶"}</span>
                        <span>
                            {!isConnected
                                ? "Sin Conexión"
                                : isPlaying
                                    ? "Detener"
                                    : "Play Metrónomo"}
                        </span>
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 text-xs font-semibold tracking-wider uppercase text-[#94A3B8]">
                    <span>Compás {currentExercise.timeSignature}</span>
                    <span>
                        Progreso: {currentNoteIndex} / {currentExercise.notes.length} Notas
                    </span>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="w-full bg-[#E2E8F0] text-[#0A1128] rounded-xl p-4 flex items-center justify-start overflow-x-auto shadow-inner scroll-smooth"
                >
                    <div
                        style={{ width: `${staveWidth}px` }}
                        className="relative min-h-[180px] shrink-0 flex items-center justify-start mx-auto"
                    >
                        <div
                            style={{
                                transform: `translateX(${cursorX}px)`,
                                transition:
                                    isPlaying && beatStep >= 0 && cursorTransitionMs > 0
                                        ? `transform ${cursorTransitionMs}ms linear`
                                        : "none",
                            }}
                            className={`absolute left-0 top-5 bottom-5 w-[2.5px] rounded-sm z-10 pointer-events-none ${beatStep < 0 && isPlaying
                                ? "bg-slate-500/50"
                                : "bg-blue-600/65"
                                }`}
                        />

                        <div
                            ref={containerRef}
                            style={{ width: `${staveWidth}px` }}
                            className="h-[180px]"
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <span className="px-3 py-1 rounded-md bg-blue-500/20 border border-blue-400 text-xs font-bold text-blue-300">
                        {currentExercise.notes[currentNoteIndex]
                            ? `Nota objetivo: ${formatNoteBySystem(
                                currentExercise.notes[currentNoteIndex].pitch,
                                appSettings.notation
                            )}`
                            : "¡Ejercicio completado!"}
                    </span>
                </div>

                <div className="mt-8 pt-6 border-t border-blue-900/40 flex flex-wrap items-center justify-between gap-4">
                    <button
                        type="button"
                        disabled={!isConnected}
                        className="px-4 py-2.5 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-[#E2E8F0] cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none"
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
                            className="px-4 py-2.5 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-blue-300 cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none"
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

                        <span className="text-xs font-semibold text-[#94A3B8] px-2">
                            {exerciseInPlay + 1} / {exercisesDataFiltered.length}
                        </span>

                        <button
                            type="button"
                            disabled={!canGoNext}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-[#F1F5F9] shadow-lg cursor-pointer transition-all disabled:opacity-40 disabled:bg-slate-700 disabled:shadow-none disabled:pointer-events-none"
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