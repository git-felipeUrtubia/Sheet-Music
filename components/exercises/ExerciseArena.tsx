// components/exercises/ExerciseArena.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Vex from "vexflow";
import { EXERCISES_DATA } from "@/data/exercises";
import { useAudioPitch } from "@/hooks/useAudioPitch";
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

    // Estado reactivo de los ajustes para detectar en vivo si el micrófono se apaga o enciende
    const [appSettings, setAppSettings] = useState<AppSettings>(() => loadAppSettings());
    const isMicEnabled = appSettings.micEnabled !== false;

    // Estados del Metrónomo y Línea de Tiempo
    const [bpm, setBpm] = useState<number>(70);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [beatStep, setBeatStep] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<string>(
        loadAppSettings().micEnabled === false
            ? "Activa el micrófono en Ajustes (⚙️) para iniciar"
            : "Presiona Play para iniciar"
    );
    const [cursorX, setCursorX] = useState<number>(80);
    const [cursorTransitionMs, setCursorTransitionMs] = useState<number>(0);

    const { detectedMidi } = useAudioPitch();

    // Referencias
    const containerRef = useRef<HTMLDivElement | null>(null);
    const notePositionsRef = useRef<number[]>([]);
    const metroAudioCtxRef = useRef<AudioContext | null>(null);
    const beatStartTimeRef = useRef<number>(0);

    const currentNoteIndexRef = useRef<number>(0);
    currentNoteIndexRef.current = currentNoteIndex;
    const lastMatchedMidiRef = useRef<number | null>(null);

    const exercisesDataFiltered = EXERCISES_DATA.filter((it) => it.level === level);
    const currentExercise = exercisesDataFiltered[exerciseInPlay];

    const isExerciseFinished = currentNoteIndex >= currentExercise.notes.length;
    const isLastExercise = exerciseInPlay === exercisesDataFiltered.length - 1;
    const isLessonFinished = isExerciseFinished && isLastExercise;

    const canGoPrev = exerciseInPlay > 0;
    const canGoNext = isExerciseFinished || exerciseInPlay < maxUnlockedExercise;

    // Escuchar cambios en Ajustes (⚙️) en tiempo real
    useEffect(() => {
        const handleSettingsUpdate = () => {
            const updated = loadAppSettings();
            setAppSettings(updated);

            if (updated.micEnabled === false) {
                setIsPlaying(false);
                setBeatStep(0);
                setCursorTransitionMs(0);
                if (notePositionsRef.current.length > 0) {
                    setCursorX(notePositionsRef.current[0]);
                }
                setStatusMessage("Micrófono desactivado • Actívalo en Ajustes (⚙️)");
            } else {
                setStatusMessage((prev) =>
                    prev.includes("Micrófono") || prev.includes("Activa el micrófono")
                        ? "Presiona Play para iniciar"
                        : prev
                );
            }
        };

        window.addEventListener("app-settings-updated", handleSettingsUpdate);
        window.addEventListener("storage", handleSettingsUpdate);
        return () => {
            window.removeEventListener("app-settings-updated", handleSettingsUpdate);
            window.removeEventListener("storage", handleSettingsUpdate);
        };
    }, []);

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

    // 2. Botón Play / Detener (Bloqueado si el micrófono está apagado)
    const handleTogglePlay = () => {
        if (!isMicEnabled) {
            setStatusMessage("Debes activar el micrófono en Ajustes (⚙️) para practicar");
            return;
        }

        setCursorTransitionMs(0);
        if (isPlaying) {
            setIsPlaying(false);
            setCurrentNoteIndex(0);
            currentNoteIndexRef.current = 0;
            lastMatchedMidiRef.current = null;
            setBeatStep(0);
            setStatusMessage("Detenido");
            if (notePositionsRef.current.length > 0) {
                setCursorX(notePositionsRef.current[0]);
            }
        } else {
            setCurrentNoteIndex(0);
            currentNoteIndexRef.current = 0;
            lastMatchedMidiRef.current = null;
            setBeatStep(-4);
            setIsPlaying(true);
            setStatusMessage("Prepárate: 4...");
            if (notePositionsRef.current.length > 0) {
                setCursorX(notePositionsRef.current[0]);
            }
        }
    };

    // 3. Reloj del Metrónomo + Movimiento continuo de la aguja
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

        let raf1: number;
        let raf2: number;

        if (beatStep < 0) {
            setStatusMessage(`Prepárate: ${Math.abs(beatStep)}...`);
            setCursorTransitionMs(0);
            if (notePositionsRef.current.length > 0) {
                setCursorX(notePositionsRef.current[0]);
            }
        } else if (beatStep < currentExercise.notes.length) {
            const currentMeasureBeat = Math.floor(accumulatedBeats) + 1;
            setStatusMessage(
                `Pulso ${currentMeasureBeat} • Nota ${beatStep + 1} de ${currentExercise.notes.length}`
            );

            const currentX = notePositionsRef.current[beatStep] ?? 80;
            const nextX =
                beatStep + 1 < notePositionsRef.current.length
                    ? notePositionsRef.current[beatStep + 1]
                    : 660;

            if (beatStep === 0) {
                setCursorTransitionMs(stepDurationMs);
                setCursorX(nextX);
            } else {
                setCursorTransitionMs(0);
                setCursorX(currentX);
                raf1 = requestAnimationFrame(() => {
                    raf2 = requestAnimationFrame(() => {
                        setCursorTransitionMs(stepDurationMs);
                        setCursorX(nextX);
                    });
                });
            }
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
            if (raf1) cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
        };
    }, [isPlaying, beatStep, bpm, currentExercise, exerciseInPlay, playMetronomeClick]);

    // 4. Validación de notas en el pentagrama
    useEffect(() => {
        if (!isPlaying || beatStep < -1) return;
        if (detectedMidi === null) {
            lastMatchedMidiRef.current = null;
            return;
        }
        if (currentNoteIndex >= currentExercise.notes.length) return;

        const targetNote = currentExercise.notes[currentNoteIndex];
        const prevNote = currentNoteIndex > 0 ? currentExercise.notes[currentNoteIndex - 1] : null;

        if (
            prevNote &&
            prevNote.midiNote === targetNote.midiNote &&
            detectedMidi === lastMatchedMidiRef.current
        ) {
            return;
        }

        if (detectedMidi === targetNote.midiNote) {
            lastMatchedMidiRef.current = detectedMidi;
            const nextIdx = currentNoteIndex + 1;
            currentNoteIndexRef.current = nextIdx;
            setCurrentNoteIndex(nextIdx);

            if (nextIdx >= currentExercise.notes.length) {
                setMaxUnlockedExercise((prev) => Math.max(prev, exerciseInPlay + 1));
            }
        }
    }, [detectedMidi, isPlaying, beatStep, currentNoteIndex, currentExercise, exerciseInPlay]);

    // 5. Dibujado del Pentagrama con VexFlow
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam } = (Vex as any).Flow || Vex;

        container.innerHTML = "";

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(700, 180);
        const context = renderer.getContext();

        const stave = new Stave(10, 30, 680);
        stave
            .addClef(currentExercise.clef)
            .addTimeSignature(currentExercise.timeSignature);
        stave.setContext(context).draw();

        const vexNotes = currentExercise.notes.map((noteItem, index) => {
            const staveNote = new StaveNote({
                clef: currentExercise.clef,
                keys: [noteItem.pitch],
                duration: noteItem.duration,
            });

            if (index < currentNoteIndex) {
                staveNote.setStyle({ fillStyle: "#10B981", strokeStyle: "#10B981" });
            } else if (index === currentNoteIndex) {
                staveNote.setStyle({ fillStyle: "#2563EB", strokeStyle: "#2563EB" });
            }

            return staveNote;
        });

        const voice = new Voice({ numBeats: 4, beatValue: 4 });
        voice.addTickables(vexNotes);

        new Formatter().joinVoices([voice]).format([voice], 580);
        const beams = Beam.generateBeams(vexNotes);
        voice.draw(context, stave);
        beams.forEach((beam: any) => beam.setContext(context).draw());

        const positions = vexNotes.map((note) => note.getAbsoluteX() + 6);
        notePositionsRef.current = positions;

        if (!isPlaying && positions.length > 0) {
            setCursorTransitionMs(0);
            setCursorX(positions[0]);
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
                            Toca cada nota cuando la aguja pase sobre ella
                        </p>
                    </div>
                </div>
            </header>

            {/* Alerta visible cuando el micrófono está desactivado */}
            {!isMicEnabled && (
                <div className="w-full mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between gap-4 text-amber-300">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">⚠️</span>
                        <div>
                            <p className="text-xs md:text-sm font-bold text-amber-200">
                                El micrófono está desactivado
                            </p>
                            <p className="text-xs text-amber-300/90">
                                Debes tener el micrófono encendido en Ajustes (⚙️) en el menú principal para poder iniciar y evaluar los ejercicios.
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
                            disabled={isPlaying || !isMicEnabled}
                            onChange={(e) => setBpm(Number(e.target.value))}
                            className="w-32 md:w-44 accent-blue-500 cursor-pointer disabled:opacity-50"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${!isMicEnabled
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
                        disabled={!isMicEnabled}
                        onClick={handleTogglePlay}
                        title={
                            !isMicEnabled
                                ? "Activa el micrófono en Ajustes para poder iniciar"
                                : undefined
                        }
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#F1F5F9] shadow-lg transition-all ${!isMicEnabled
                                ? "bg-slate-700 text-slate-400 opacity-50 cursor-not-allowed shadow-none"
                                : isPlaying
                                    ? "bg-rose-600 hover:bg-rose-500 cursor-pointer active:scale-95"
                                    : "bg-emerald-600 hover:bg-emerald-500 cursor-pointer active:scale-95"
                            }`}
                    >
                        <span>{isPlaying ? "■" : "▶"}</span>
                        <span>
                            {!isMicEnabled
                                ? "Micrófono Apagado"
                                : isPlaying
                                    ? "Detener"
                                    : "Play Metrónomo"}
                        </span>
                    </button>
                </div>

                <div className="flex justify-between items-center mb-4 text-xs font-semibold tracking-wider uppercase text-[#94A3B8]">
                    <span>Compás 1 • {currentExercise.timeSignature}</span>
                    <span>
                        Progreso: {currentNoteIndex} / {currentExercise.notes.length} Notas
                    </span>
                </div>

                {/* Pentagrama + Aguja Vertical suave estilo MuseScore */}
                <div className="w-full bg-[#E2E8F0] text-[#0A1128] rounded-xl p-4 flex items-center justify-center overflow-x-auto shadow-inner">
                    <div className="relative w-[700px] min-h-[180px] flex items-center justify-center">
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

                        <div ref={containerRef} className="w-[700px] h-[180px]" />
                    </div>
                </div>

                {/* Feedback inferior */}
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

                {/* Controles inferiores de navegación y reinicio */}
                <div className="mt-8 pt-6 border-t border-blue-900/40 flex flex-wrap items-center justify-between gap-4">
                    {/* Botón Reiniciar */}
                    <button
                        type="button"
                        disabled={!isMicEnabled}
                        className="px-4 py-2.5 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-[#E2E8F0] cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        onClick={() => {
                            setIsPlaying(false);
                            setCurrentNoteIndex(0);
                            currentNoteIndexRef.current = 0;
                            lastMatchedMidiRef.current = null;
                            setBeatStep(0);
                            setCursorTransitionMs(0);
                            setStatusMessage("Reiniciado");
                            if (notePositionsRef.current.length > 0) {
                                setCursorX(notePositionsRef.current[0]);
                            }
                        }}
                    >
                        ↺ Reiniciar ejercicio
                    </button>

                    {/* Navegación entre ejercicios de la lección */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={!canGoPrev}
                            className="px-4 py-2.5 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-blue-300 cursor-pointer transition-all disabled:opacity-40 disabled:pointer-events-none"
                            onClick={() => {
                                if (canGoPrev) {
                                    setIsPlaying(false);
                                    setCursorTransitionMs(0);
                                    setExerciseInPlay((prev) => prev - 1);
                                    setCurrentNoteIndex(0);
                                    currentNoteIndexRef.current = 0;
                                    lastMatchedMidiRef.current = null;
                                    setBeatStep(0);
                                    setStatusMessage(
                                        isMicEnabled
                                            ? "Presiona Play para iniciar"
                                            : "Activa el micrófono en Ajustes (⚙️) para iniciar"
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
                                    setExerciseInPlay((prev) => prev + 1);
                                    setCurrentNoteIndex(0);
                                    currentNoteIndexRef.current = 0;
                                    lastMatchedMidiRef.current = null;
                                    setBeatStep(0);
                                    setStatusMessage(
                                        isMicEnabled
                                            ? "Presiona Play para iniciar"
                                            : "Activa el micrófono en Ajustes (⚙️) para iniciar"
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