// components/catalog/ScoreViewer.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { SplendidGrandPiano, Soundfont } from "smplr";
import { SheetMusicItem } from "@/types/catalog";
import { isPdfAsset, loadScoreMarkup, publicAssetUrl } from "@/lib/sheetData";

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
    const isPdf = isPdfAsset(score.scoreFile);

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

    // Inicialización y renderizado de la partitura (IPC en escritorio, archivo público en web)
    useEffect(() => {
        let isMounted = true;
        if (isPdf) {
            setIsLoadingScore(false);
            setLoadError(null);
            setTotalMeasures(score.measuresCount);
            setCurrentMeasure(1);
            return;
        }

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

                const xmlDataOrUrl = await loadScoreMarkup(score);
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
                    setLoadError(`No se pudo cargar la partitura "${score.title}".`);
                    setIsLoadingScore(false);
                }
            }
        };

        loadAndRenderScore();
        return () => {
            isMounted = false;
        };
    }, [isPdf, score]);

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
        <section className="studio-fade relative mx-auto flex w-full max-w-6xl flex-col">
            <header className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            handleRestartScore();
                            onBack();
                        }}
                        className="cursor-pointer rounded-full border border-pink-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-rose-950 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-pink-500/20 dark:bg-slate-900/80 dark:text-pink-50"
                    >
                        ← Volver al catálogo
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="font-display text-3xl leading-none text-rose-950 dark:text-pink-50 md:text-4xl">
                                {score.title}
                            </h1>
                            <span className="rounded-full border border-pink-200 bg-pink-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-rose-800 dark:border-pink-500/30 dark:bg-pink-500/15 dark:text-pink-100">
                                {score.instrument}
                            </span>
                            <span className="rounded-full border border-rose-200/80 bg-white/80 px-3 py-0.5 text-[11px] font-semibold capitalize text-rose-700 dark:border-pink-500/20 dark:bg-slate-950/50 dark:text-pink-100">
                                {score.level}
                            </span>
                        </div>
                        <p className="mt-1.5 text-sm text-rose-900/60 dark:text-pink-100/55">
                            {score.composer} • Compás {score.timeSignature} • Nivel {score.level}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/85 px-2 py-1.5 shadow-sm backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/80">
                    <span className="pl-2 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">Zoom:</span>
                    <button
                        type="button"
                        onClick={() => handleZoomChange(zoom - 0.1)}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-pink-50 text-sm font-bold text-rose-950 dark:bg-slate-800 dark:text-pink-50"
                    >
                        -
                    </button>
                    <span className="min-w-[46px] text-center font-mono text-xs font-bold text-rose-700 dark:text-pink-200">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        type="button"
                        onClick={() => handleZoomChange(zoom + 0.1)}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-pink-50 text-sm font-bold text-rose-950 dark:bg-slate-800 dark:text-pink-50"
                    >
                        +
                    </button>
                </div>
            </header>

            <div className="relative rounded-[2rem] border border-pink-200/70 bg-[radial-gradient(circle_at_top,rgba(255,228,236,0.95),rgba(255,248,250,0.45))] p-3 shadow-xl shadow-pink-200/30 dark:border-pink-500/20 dark:bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.18),rgba(11,13,23,0.45))] dark:shadow-black/50 md:p-4">
                <div className="relative min-h-[560px] overflow-x-auto rounded-[1.5rem] border border-white/80 bg-[#FFFDFB] px-4 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_50px_-36px_rgba(190,24,93,0.45)] md:px-10">
                    {isLoadingScore && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[1.5rem] bg-[#FFFDFB]/92">
                            <p className="animate-pulse font-display text-xl text-rose-900/70">
                                Renderizando partitura de alta definición...
                            </p>
                        </div>
                    )}
                    {loadError && (
                        <div className="mx-auto my-12 max-w-lg rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
                            <p className="text-sm font-bold text-rose-700">{loadError}</p>
                            <p className="mt-1 text-xs text-rose-900/60">
                                Verifica que el archivo esté disponible en el catálogo.
                            </p>
                        </div>
                    )}
                    {isPdf ? (
                        <iframe
                            title={score.title}
                            src={publicAssetUrl(score.scoreFile)}
                            className="h-[70vh] w-full rounded-2xl bg-white"
                        />
                    ) : (
                        <div ref={osmdContainerRef} className="w-full" />
                    )}
                    <div className="h-28" />
                </div>

                <div className="pointer-events-none sticky bottom-24 z-30 -mt-24 px-1 md:bottom-4">
                    <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-pink-200/80 bg-white/92 px-4 py-3 shadow-2xl shadow-pink-300/35 backdrop-blur-xl dark:border-pink-500/25 dark:bg-slate-900/92 dark:shadow-black/50">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRestartScore}
                                disabled={isLoadingScore}
                                title="Reiniciar partitura"
                                className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-pink-200/80 bg-pink-50 text-base font-bold text-rose-950 transition disabled:opacity-40 dark:border-pink-500/20 dark:bg-slate-800 dark:text-pink-50"
                            >
                                ↺
                            </button>
                            <button
                                type="button"
                                onClick={handleTogglePlay}
                                disabled={isPdf || isLoadingScore || isLoadingAudio || !!loadError}
                                className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-lg transition active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
                                    isPlaying
                                        ? "bg-gradient-to-r from-amber-200 to-orange-200 text-rose-950"
                                        : "bg-gradient-to-r from-pink-400 to-rose-400 text-rose-950 shadow-pink-300/40"
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

                        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                            <div className="flex justify-between text-[11px] font-semibold text-rose-900/55 dark:text-pink-100/55">
                                <span>
                                    Compás {currentMeasure} de {totalMeasures}
                                </span>
                                <span className="text-rose-500 dark:text-pink-300">
                                    {isLoadingAudio
                                        ? "Descargando muestras..."
                                        : `Audio: ${score.instrument.toUpperCase()} HD`}
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-pink-100 dark:bg-slate-800">
                                <div
                                    style={{ width: `${progressPercent}%` }}
                                    className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-full border border-pink-100 bg-rose-50/80 px-4 py-2 dark:border-pink-500/20 dark:bg-slate-950/50">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                                    Tempo
                                </span>
                                <span className="font-mono text-sm font-extrabold text-rose-950 dark:text-pink-50">
                                    {bpm} <span className="text-[11px] text-rose-400">BPM</span>
                                </span>
                            </div>
                            <input
                                type="range"
                                min={40}
                                max={200}
                                step={2}
                                value={bpm}
                                onChange={(e) => setBpm(Number(e.target.value))}
                                className="w-28 cursor-pointer accent-rose-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}