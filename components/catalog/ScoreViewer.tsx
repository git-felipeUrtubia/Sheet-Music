// components/catalog/ScoreViewer.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { SplendidGrandPiano, Soundfont } from "smplr";
import { SheetMusicItem } from "@/types/catalog";

interface ScoreViewerProps {
    score: SheetMusicItem;
    onBack: () => void;
}

export default function ScoreViewer({ score, onBack }: ScoreViewerProps) {
    const [isLoadingScore, setIsLoadingScore] = useState<boolean>(true);
    const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [bpm, setBpm] = useState<number>(score.bpm);
    const [zoom, setZoom] = useState<number>(1.0); // 1.0 = 100%
    const [currentMeasure, setCurrentMeasure] = useState<number>(1);
    const [totalMeasures, setTotalMeasures] = useState<number>(score.measuresCount);

    const osmdContainerRef = useRef<HTMLDivElement | null>(null);
    const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const instrumentPlayerRef = useRef<SplendidGrandPiano | Soundfont | null>(null);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isPlayingRef = useRef<boolean>(false);
    isPlayingRef.current = isPlaying;
    const bpmRef = useRef<number>(bpm);
    bpmRef.current = bpm;

    // Inicialización del motor de audio realista (Smplr)
    useEffect(() => {
        let isMounted = true;
        setIsLoadingAudio(true);
        const initAudioEngine = async () => {
            try {
                const ctx = new AudioContext();
                audioCtxRef.current = ctx;
                let player: SplendidGrandPiano | Soundfont;

                if (score.instrument === "piano") {
                    player = new SplendidGrandPiano(ctx);
                } else {
                    const sfInstrumentName = score.instrument === "violin" ? "violin" : "flute";
                    player = new Soundfont(ctx, { instrument: sfInstrumentName });
                }

                await player.load;
                if (isMounted) {
                    instrumentPlayerRef.current = player;
                    setIsLoadingAudio(false);
                }
            } catch (error) {
                console.error("Error cargando samples del instrumento:", error);
                if (isMounted) setIsLoadingAudio(false);
            }
        };
        initAudioEngine();

        return () => {
            isMounted = false;
            if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
            if (instrumentPlayerRef.current) instrumentPlayerRef.current.stop();
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, [score.instrument]);

    // Inicialización y renderizado de la partitura desde SQLite (o respaldo estático)
    useEffect(() => {
        let isMounted = true;
        const container = osmdContainerRef.current;
        if (!container) return;

        const loadAndRenderScore = async () => {
            setIsLoadingScore(true);
            setLoadError(null);
            try {
                container.innerHTML = "";
                const osmd = new OpenSheetMusicDisplay(container, {
                    autoResize: true,
                    backend: "svg",
                    drawingParameters: "default",
                    drawTitle: true,
                    drawComposer: true,
                    followCursor: true,
                });

                // 1. Obtener XML directamente desde SQLite usando el puente IPC de Electron
                let xmlDataOrUrl: string | null = null;
                if (typeof window !== "undefined" && window.electronDB) {
                    xmlDataOrUrl = await window.electronDB.getScoreXml(score.id);
                }

                // 2. Respaldo a archivo físico si no se encuentra en la base de datos
                if (!xmlDataOrUrl) {
                    xmlDataOrUrl = score.scoreFile;
                }

                await osmd.load(xmlDataOrUrl);
                if (!isMounted) return;

                osmd.zoom = zoom;
                osmd.render();
                osmd.cursor.show();
                osmd.cursor.reset();
                osmdRef.current = osmd;

                const realMeasuresCount = osmd.Sheet?.SourceMeasures?.length || score.measuresCount;
                setTotalMeasures(realMeasuresCount);
                setCurrentMeasure(1);
                setIsLoadingScore(false);
            } catch (err) {
                console.error("Error al renderizar MusicXML:", err);
                if (isMounted) {
                    setLoadError(
                        `No se pudo cargar la partitura "${score.title}" desde la base de datos.`
                    );
                    setIsLoadingScore(false);
                }
            }
        };

        loadAndRenderScore();
        return () => {
            isMounted = false;
        };
    }, [score.id, score.scoreFile, score.measuresCount, score.title]);

    const handleZoomChange = (newZoom: number) => {
        const clampedZoom = Math.min(1.6, Math.max(0.6, Number(newZoom.toFixed(1))));
        setZoom(clampedZoom);
        if (osmdRef.current) {
            osmdRef.current.zoom = clampedZoom;
            osmdRef.current.render();
            osmdRef.current.cursor.show();
        }
    };

    const playCurrentCursorStep = useCallback(() => {
        const osmd = osmdRef.current;
        const player = instrumentPlayerRef.current;
        if (!osmd || !osmd.cursor || !isPlayingRef.current) return;
        const iterator = osmd.cursor.Iterator;

        if (iterator.EndReached) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            osmd.cursor.reset();
            setCurrentMeasure(1);
            return;
        }

        setCurrentMeasure(iterator.CurrentMeasureIndex + 1);
        const wholeNoteSeconds = (60 / bpmRef.current) * 4;
        let minStepFraction = 1.0;

        const voiceEntries = iterator.CurrentVoiceEntries || [];
        const graceNotesToPlay: number[] = [];
        voiceEntries.forEach((ve: any) => {
            if (ve.GraceNotes && ve.GraceNotes.length > 0) {
                ve.GraceNotes.forEach((gn: any) => {
                    if (gn && !gn.isRest()) {
                        graceNotesToPlay.push(gn.halfTone + 12);
                    }
                });
            }
        });

        const notesUnderCursor = osmd.cursor.NotesUnderCursor();
        notesUnderCursor.forEach((note: any) => {
            if (note && !note.isRest() && (note.IsGraceNote || note.Length.RealValue === 0)) {
                const midi = note.halfTone + 12;
                if (!graceNotesToPlay.includes(midi)) {
                    graceNotesToPlay.push(midi);
                }
            }
        });

        const graceNoteDurationSec = 0.075;
        const totalGraceOffsetSec = graceNotesToPlay.length * graceNoteDurationSec;
        if (player && audioCtxRef.current && graceNotesToPlay.length > 0) {
            const now = audioCtxRef.current.currentTime;
            graceNotesToPlay.forEach((midi, idx) => {
                player.start({
                    note: midi,
                    time: now + idx * graceNoteDurationSec,
                    duration: graceNoteDurationSec * 0.95,
                    velocity: 72,
                });
            });
        }

        notesUnderCursor.forEach((note: any) => {
            if (!note) return;
            const noteFraction = note.Length.RealValue;
            if (note.IsGraceNote || noteFraction <= 0) return;
            if (noteFraction < minStepFraction) {
                minStepFraction = noteFraction;
            }
            if (note.isRest()) return;

            if (note.NoteTie) {
                const tieNotes = note.NoteTie.Notes || [];
                const isFirstNoteOfTie =
                    note.NoteTie.StartNote === note ||
                    (tieNotes.length > 0 && tieNotes[0] === note);
                if (!isFirstNoteOfTie) return;
            }

            let totalTiedFraction = noteFraction;
            if (note.NoteTie && Array.isArray(note.NoteTie.Notes) && note.NoteTie.Notes.length > 1) {
                totalTiedFraction = note.NoteTie.Notes.reduce(
                    (sum: number, tiedNote: any) => sum + (tiedNote?.Length?.RealValue || 0),
                    0
                );
            }

            if (player && audioCtxRef.current) {
                const midiNote = note.halfTone + 12;
                const totalDurationSec = totalTiedFraction * wholeNoteSeconds;
                const now = audioCtxRef.current.currentTime;
                const effectiveDuration = Math.max(0.1, totalDurationSec - totalGraceOffsetSec);
                player.start({
                    note: midiNote,
                    time: now + totalGraceOffsetSec,
                    duration: effectiveDuration * 0.98,
                    velocity: 85,
                });
            }
        });

        if (minStepFraction === 1.0 && notesUnderCursor.length === 0) {
            minStepFraction = 0.25;
        }
        const stepWaitMs = minStepFraction * wholeNoteSeconds * 1000;

        playbackTimeoutRef.current = setTimeout(() => {
            if (!isPlayingRef.current || !osmdRef.current) return;
            osmdRef.current.cursor.next();
            playCurrentCursorStep();
        }, stepWaitMs);
    }, []);

    const handleTogglePlay = async () => {
        if (!osmdRef.current) return;
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            await audioCtxRef.current.resume();
        }
        if (isPlaying) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
            if (instrumentPlayerRef.current) instrumentPlayerRef.current.stop();
        } else {
            setIsPlaying(true);
            isPlayingRef.current = true;
            playCurrentCursorStep();
        }
    };

    const handleRestartScore = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        if (instrumentPlayerRef.current) instrumentPlayerRef.current.stop();
        if (osmdRef.current && osmdRef.current.cursor) {
            osmdRef.current.cursor.reset();
            setCurrentMeasure(1);
        }
    };

    const progressPercent = Math.min(
        100,
        Math.round((currentMeasure / Math.max(1, totalMeasures)) * 100)
    );

    return (
        <section className="w-full max-w-6xl mx-auto flex flex-col select-none">
            <header className="w-full flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-900/50">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            handleRestartScore();
                            onBack();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#162247] hover:bg-[#1E2E5C] text-sm font-medium text-blue-300 cursor-pointer transition-colors"
                    >
                        ← Volver al catálogo
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl md:text-2xl font-extrabold text-[#F1F5F9]">
                                {score.title}
                            </h1>
                            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {score.instrument}
                            </span>
                        </div>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                            {score.composer} • Compás {score.timeSignature} • Nivel {score.level}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-[#111C3D] px-3 py-1.5 rounded-xl border border-blue-900/60">
                    <span className="text-xs font-semibold text-[#94A3B8] mr-1">Zoom:</span>
                    <button
                        type="button"
                        onClick={() => handleZoomChange(zoom - 0.1)}
                        className="w-7 h-7 rounded-lg bg-[#0A1128] hover:bg-[#162247] text-sm font-bold text-[#E2E8F0] cursor-pointer"
                    >
                        -
                    </button>
                    <span className="text-xs font-mono font-bold text-blue-300 min-w-[42px] text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        type="button"
                        onClick={() => handleZoomChange(zoom + 0.1)}
                        className="w-7 h-7 rounded-lg bg-[#0A1128] hover:bg-[#162247] text-sm font-bold text-[#E2E8F0] cursor-pointer"
                    >
                        +
                    </button>
                </div>
            </header>

            <div className="sticky top-4 z-30 w-full bg-[#111C3D]/95 backdrop-blur-md border-2 border-blue-900/60 rounded-2xl p-4 my-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleRestartScore}
                        disabled={isLoadingScore}
                        title="Reiniciar partitura"
                        className="p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#162247] border border-blue-900/50 text-sm font-bold text-[#E2E8F0] cursor-pointer transition-colors disabled:opacity-40"
                    >
                        ↺
                    </button>
                    <button
                        type="button"
                        onClick={handleTogglePlay}
                        disabled={isLoadingScore || isLoadingAudio || !!loadError}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-[#F1F5F9] shadow-lg cursor-pointer transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${isPlaying
                                ? "bg-amber-600 hover:bg-amber-500"
                                : "bg-emerald-600 hover:bg-emerald-500"
                            }`}
                    >
                        <span>{isPlaying ? "⏸" : "▶"}</span>
                        <span>
                            {isLoadingAudio
                                ? "Cargando audio HD..."
                                : isPlaying
                                    ? "Pausar Obra"
                                    : "Reproducir Obra"}
                        </span>
                    </button>
                </div>

                <div className="flex-1 min-w-[200px] max-w-md flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[#94A3B8]">
                        <span>
                            Compás {currentMeasure} de {totalMeasures}
                        </span>
                        <span className="text-emerald-400">
                            {isLoadingAudio
                                ? "Descargando muestras..."
                                : `Audio: ${score.instrument.toUpperCase()} HD`}
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#0A1128] overflow-hidden border border-blue-900/50">
                        <div
                            style={{ width: `${progressPercent}%` }}
                            className="h-full bg-blue-500 transition-all duration-200"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-[#0A1128] px-4 py-2 rounded-xl border border-blue-900/50">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                            Tempo
                        </span>
                        <span className="text-sm font-mono font-extrabold text-[#F1F5F9]">
                            {bpm} <span className="text-[11px] text-blue-400">BPM</span>
                        </span>
                    </div>
                    <input
                        type="range"
                        min={40}
                        max={200}
                        step={2}
                        value={bpm}
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-28 accent-blue-500 cursor-pointer"
                    />
                </div>
            </div>

            <div className="relative w-full bg-[#F8FAFC] text-[#0A1128] rounded-2xl p-6 md:p-10 shadow-2xl min-h-[520px] overflow-x-auto border-4 border-blue-900/40">
                {isLoadingScore && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC]/90 z-10 rounded-2xl">
                        <p className="text-sm font-bold text-slate-600 animate-pulse">
                            Renderizando partitura de alta definición...
                        </p>
                    </div>
                )}
                {loadError && (
                    <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center my-12">
                        <p className="text-sm font-bold text-rose-600 mb-1">{loadError}</p>
                        <p className="text-xs text-slate-600">
                            Verifica que la partitura esté correctamente almacenada en la base de datos.
                        </p>
                    </div>
                )}
                <div ref={osmdContainerRef} className="w-full" />
            </div>
        </section>
    );
}