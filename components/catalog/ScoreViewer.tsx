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
    // ============================================================================
    // 1. ESTADOS DE INTERFAZ Y REPRODUCCIÓN
    // ============================================================================
    const [isLoadingScore, setIsLoadingScore] = useState<boolean>(true);
    const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [bpm, setBpm] = useState<number>(score.bpm);
    const [zoom, setZoom] = useState<number>(1.0); // 1.0 = 100%
    const [currentMeasure, setCurrentMeasure] = useState<number>(1);
    const [totalMeasures, setTotalMeasures] = useState<number>(score.measuresCount);

    // ============================================================================
    // 2. REFERENCIAS PARA INSTANCIAS EXTERNAS (DOM, OSMD Y MOTOR DE AUDIO)
    // ============================================================================
    // Guardamos estas instancias en useRef porque mutan fuera del ciclo de React
    // y no queremos que re-rendericen toda la pantalla en cada milisegundo.
    const osmdContainerRef = useRef<HTMLDivElement | null>(null);
    const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const instrumentPlayerRef = useRef<SplendidGrandPiano | Soundfont | null>(null);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Referencias en vivo de estados para que el bucle recursivo de reproducción
    // siempre lea el BPM y el estado de Play más reciente sin reiniciar el efecto.
    const isPlayingRef = useRef<boolean>(false);
    isPlayingRef.current = isPlaying;

    const bpmRef = useRef<number>(bpm);
    bpmRef.current = bpm;

    // ============================================================================
    // 3. INICIALIZACIÓN DEL MOTOR DE AUDIO REALISTA (SMPLR)
    // ============================================================================
    useEffect(() => {
        let isMounted = true;
        setIsLoadingAudio(true);

        const initAudioEngine = async () => {
            try {
                const ctx = new AudioContext();
                audioCtxRef.current = ctx;

                let player: SplendidGrandPiano | Soundfont;

                // Si la partitura es de piano, cargamos el piano de cola muestreado en HD.
                // Si es violín o flauta, cargamos su Soundfont orquestal correspondiente.
                if (score.instrument === "piano") {
                    player = new SplendidGrandPiano(ctx);
                } else {
                    const sfInstrumentName = score.instrument === "violin" ? "violin" : "flute";
                    player = new Soundfont(ctx, { instrument: sfInstrumentName });
                }

                // Esperamos a que se descarguen las muestras de audio
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

        // Limpieza al salir del visor: detenemos cualquier sonido y cerramos el AudioContext
        return () => {
            isMounted = false;
            if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
            if (instrumentPlayerRef.current) instrumentPlayerRef.current.stop();
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, [score.instrument]);

    // ============================================================================
    // 4. INICIALIZACIÓN Y RENDERIZADO DE LA PARTITURA (OSMD)
    // ============================================================================
    useEffect(() => {
        let isMounted = true;
        const container = osmdContainerRef.current;
        if (!container) return;

        const loadAndRenderScore = async () => {
            setIsLoadingScore(true);
            setLoadError(null);

            try {
                container.innerHTML = "";

                // Instanciamos OSMD configurando el diseño de página y el cursor integrado
                const osmd = new OpenSheetMusicDisplay(container, {
                    autoResize: true,
                    backend: "svg",
                    drawingParameters: "default",
                    drawTitle: true,
                    drawComposer: true,
                    followCursor: true, // Hace scroll automático siguiendo al cursor
                });

                // Cargamos el archivo .musicxml desde la carpeta public/scores/
                await osmd.load(score.scoreFile);

                if (!isMounted) return;

                osmd.zoom = zoom;
                osmd.render();

                // Configuramos y mostramos el cursor de lectura sobre el primer tiempo
                osmd.cursor.show();
                osmd.cursor.reset();

                osmdRef.current = osmd;

                // Obtenemos la cantidad real de compases directamente desde el archivo XML
                const realMeasuresCount = osmd.Sheet?.SourceMeasures?.length || score.measuresCount;
                setTotalMeasures(realMeasuresCount);
                setCurrentMeasure(1);
                setIsLoadingScore(false);
            } catch (err) {
                console.error("Error al renderizar MusicXML:", err);
                if (isMounted) {
                    setLoadError(
                        `No se pudo cargar el archivo "${score.scoreFile}". Asegúrate de que exista dentro de la carpeta public/scores/.`
                    );
                    setIsLoadingScore(false);
                }
            }
        };

        loadAndRenderScore();

        return () => {
            isMounted = false;
        };
    }, [score.scoreFile, score.measuresCount]);

    // ============================================================================
    // 5. CONTROL DE ZOOM DINÁMICO
    // ============================================================================
    const handleZoomChange = (newZoom: number) => {
        const clampedZoom = Math.min(1.6, Math.max(0.6, Number(newZoom.toFixed(1))));
        setZoom(clampedZoom);

        if (osmdRef.current) {
            osmdRef.current.zoom = clampedZoom;
            osmdRef.current.render();
            // Volvemos a mostrar el cursor después de re-escalar el SVG
            osmdRef.current.cursor.show();
        }
    };

    // ============================================================================
    // 6. MOTOR DE REPRODUCCIÓN PASO A PASO (LECTURA DEL CURSOR + SONIDO)
    // ============================================================================
    /**
     * Esta función lee todas las notas (o acordes de ambas manos) que están justo
     * debajo del cursor actual de OSMD, las hace sonar con Smplr, calcula cuánto
     * tiempo debe esperar hasta la siguiente figura musical y avanza el cursor.
     */
    // ============================================================================
    // 6. MOTOR DE REPRODUCCIÓN PASO A PASO (SOPORTE DE LIGADURAS Y GRACE NOTES)
    // ============================================================================
    const playCurrentCursorStep = useCallback(() => {
        const osmd = osmdRef.current;
        const player = instrumentPlayerRef.current;

        if (!osmd || !osmd.cursor || !isPlayingRef.current) return;

        const iterator = osmd.cursor.Iterator;

        // Si llegamos al final de la partitura, detenemos la reproducción
        if (iterator.EndReached) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            osmd.cursor.reset();
            setCurrentMeasure(1);
            return;
        }

        // Actualizamos el indicador visual del compás actual
        setCurrentMeasure(iterator.CurrentMeasureIndex + 1);

        const wholeNoteSeconds = (60 / bpmRef.current) * 4;
        let minStepFraction = 1.0;

        // --------------------------------------------------------------------------
        // A. DETECTAR NOTAS DE ADORNO (GRACE NOTES) EN LAS VOCES ACTUALES
        // --------------------------------------------------------------------------
        // OSMD guarda las GraceNotes dentro de cada VoiceEntry del paso actual
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

        // También revisamos dentro de NotesUnderCursor por si el XML declaró la grace note como nota normal de duración 0
        const notesUnderCursor = osmd.cursor.NotesUnderCursor();
        notesUnderCursor.forEach((note: any) => {
            if (note && !note.isRest() && (note.IsGraceNote || note.Length.RealValue === 0)) {
                const midi = note.halfTone + 12;
                if (!graceNotesToPlay.includes(midi)) {
                    graceNotesToPlay.push(midi);
                }
            }
        });

        // Si hay notas de adorno (ej. mordentes/apoyaturas de Frieren), les damos 75ms a cada una
        // antes de que caiga la nota principal
        const graceNoteDurationSec = 0.075;
        const totalGraceOffsetSec = graceNotesToPlay.length * graceNoteDurationSec;

        if (player && audioCtxRef.current && graceNotesToPlay.length > 0) {
            const now = audioCtxRef.current.currentTime;
            graceNotesToPlay.forEach((midi, idx) => {
                player.start({
                    note: midi,
                    time: now + idx * graceNoteDurationSec,
                    duration: graceNoteDurationSec * 0.95,
                    velocity: 72, // Un poco más suaves que la nota principal
                });
            });
        }

        // --------------------------------------------------------------------------
        // B. REPRODUCIR NOTAS PRINCIPALES Y CALCULAR LIGADURAS (TIES) COMPLETAS
        // --------------------------------------------------------------------------
        notesUnderCursor.forEach((note: any) => {
            if (!note) return;

            const noteFraction = note.Length.RealValue;

            // Ignoramos las grace notes aquí porque ya las programamos en el bloque A
            if (note.IsGraceNote || noteFraction <= 0) return;

            // El paso del cursor siempre lo marca la figura rítmica más corta del pulso actual
            if (noteFraction < minStepFraction) {
                minStepFraction = noteFraction;
            }

            if (note.isRest()) return;

            // VERIFICACIÓN DE LIGADURAS DE PROLONGACIÓN (TIES):
            // Si la nota pertenece a un Tie, verificamos si es la primera nota o una continuación.
            if (note.NoteTie) {
                const tieNotes = note.NoteTie.Notes || [];
                const isFirstNoteOfTie =
                    note.NoteTie.StartNote === note ||
                    (tieNotes.length > 0 && tieNotes[0] === note);

                // Si es la segunda o tercera nota ligada, NO la volvemos a disparar
                // porque la primera nota ya sumó toda la duración de la ligadura.
                if (!isFirstNoteOfTie) return;
            }

            // Calculamos la duración real: si tiene ligadura (NoteTie), sumamos la duración
            // de todas las notas unidas por la ligadura para que el sonido no se corte.
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

                // Si hubo grace notes antes de esta nota, desplazamos ligeramente su inicio
                // y le restamos ese pequeño tiempo para no perder el pulso del compás
                const effectiveDuration = Math.max(
                    0.1,
                    totalDurationSec - totalGraceOffsetSec
                );

                player.start({
                    note: midiNote,
                    time: now + totalGraceOffsetSec,
                    duration: effectiveDuration * 0.98, // 98% para mantener el legato de la flauta
                    velocity: 85,
                });
            }
        });

        // Si el compás solo tenía un silencio completo, avanzamos según la duración del compás o negra
        if (minStepFraction === 1.0 && notesUnderCursor.length === 0) {
            minStepFraction = 0.25;
        }

        const stepWaitMs = minStepFraction * wholeNoteSeconds * 1000;

        // Programamos el siguiente paso del cursor
        playbackTimeoutRef.current = setTimeout(() => {
            if (!isPlayingRef.current || !osmdRef.current) return;
            osmdRef.current.cursor.next();
            playCurrentCursorStep();
        }, stepWaitMs);
    }, []);

    // ============================================================================
    // 7. CONTROLES DE TRANSPORTE (PLAY / PAUSA / REINICIAR)
    // ============================================================================
    const handleTogglePlay = async () => {
        if (!osmdRef.current) return;

        // Desbloqueamos el contexto de audio del navegador en el primer clic del usuario
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            await audioCtxRef.current.resume();
        }

        if (isPlaying) {
            // PAUSAR
            setIsPlaying(false);
            isPlayingRef.current = false;
            if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
            if (instrumentPlayerRef.current) instrumentPlayerRef.current.stop();
        } else {
            // REPRODUCIR
            setIsPlaying(true);
            isPlayingRef.current = true;
            playCurrentCursorStep();
        }
    };

    const handleRestartScore = () => {
        // Detenemos el audio y devolvemos el cursor al compás 1
        setIsPlaying(false);
        isPlayingRef.current = false;
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        if (instrumentPlayerRef.current) instrumentPlayerRef.current.stop();

        if (osmdRef.current && osmdRef.current.cursor) {
            osmdRef.current.cursor.reset();
            setCurrentMeasure(1);
        }
    };

    // Cálculo del porcentaje de la barra de progreso
    const progressPercent = Math.min(
        100,
        Math.round((currentMeasure / Math.max(1, totalMeasures)) * 100)
    );

    return (
        <section className="w-full max-w-6xl mx-auto flex flex-col select-none">
            {/* Barra superior de navegación e información de la obra */}
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

                {/* Controles de Zoom de la Hoja */}
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

            {/* Barra de Reproducción estilo MuseScore */}
            <div className="sticky top-4 z-30 w-full bg-[#111C3D]/95 backdrop-blur-md border-2 border-blue-900/60 rounded-2xl p-4 my-6 shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-between gap-4">
                {/* Botones de Transporte: Reiniciar y Play/Pausa */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleRestartScore}
                        disabled={isLoadingScore}
                        title="Volver al primer compás"
                        className="p-2.5 rounded-xl bg-[#0A1128] hover:bg-[#162247] border border-blue-900/50 text-sm font-bold text-[#E2E8F0] cursor-pointer transition-colors disabled:opacity-40"
                    >
                        ⏮
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

                {/* Barra de Progreso / Compás Actual */}
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

                {/* Control de Velocidad / Tempo (BPM) en tiempo real */}
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

            {/* Lienzo de Hoja de Partitura */}
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
                            Verifica que el archivo exista en la ruta indicada en data/catalog.ts
                        </p>
                    </div>
                )}

                {/* Contenedor donde OSMD dibuja el SVG de la partitura completa */}
                <div ref={osmdContainerRef} className="w-full" />
            </div>
        </section>
    );
}