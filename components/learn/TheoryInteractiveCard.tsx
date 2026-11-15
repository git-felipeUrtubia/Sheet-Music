// components/learn/TheoryInteractiveCard.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Vex from "vexflow";
import { TheoryExampleItem } from "@/data/theoryLessons";

interface TheoryInteractiveCardProps {
    item: TheoryExampleItem;
}

export default function TheoryInteractiveCard({ item }: TheoryInteractiveCardProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isPlayingDemo, setIsPlayingDemo] = useState(false);
    const [activeBeat, setActiveBeat] = useState<number | null>(null);
    const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Renderizado del pentagrama de ejemplo con VexFlow
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Dot, Accidental, StaveTie } = (Vex as any).Flow || Vex;

        const renderer = new Renderer(container, Renderer.Backends.SVG);
        renderer.resize(440, 140);
        const context = renderer.getContext();

        const stave = new Stave(10, 15, 420);
        stave.addClef(item.clef).addTimeSignature(item.timeSignature);
        stave.setContext(context).draw();

        // Sumar el total de tiempos de las notas para configurar el Voice de VexFlow
        let totalBeats = 0;

        const vexNotes = item.vexNotes.map((n) => {
            const isDotted = n.duration.endsWith("d");
            const cleanDuration = isDotted ? n.duration.replace("d", "") : n.duration;

            // Calcular la duración en tiempos para VexFlow (negra = 1)
            let noteBeats = 0;
            if (cleanDuration.includes("w")) noteBeats = 4;
            else if (cleanDuration.includes("h")) noteBeats = 2;
            else if (cleanDuration.includes("q")) noteBeats = 1;
            else if (cleanDuration.includes("8")) noteBeats = 0.5;

            if (isDotted) noteBeats *= 1.5;
            totalBeats += noteBeats;

            const note = new StaveNote({
                clef: item.clef,
                keys: n.keys,
                duration: cleanDuration,
            });

            if (isDotted) {
                Dot.buildAndAttach([note], { all: true });
            }
            if (n.accidental) {
                note.addModifier(new Accidental(n.accidental), 0);
            }

            return note;
        });

        // Configuramos la voz con la cantidad exacta de tiempos que sumaron las notas
        const voice = new Voice({
            numBeats: totalBeats,
            beatValue: 4, // El denominador siempre es 4 (cuartos/negras) en estos ejemplos
        });
        voice.setStrict(false); // Relajamos la restricción estricta de VexFlow por si acaso
        voice.addTickables(vexNotes);

        // Agrupamos corcheas si las hay
        const eighthNotes = vexNotes.filter((vn) => vn.getDuration() === "8");
        const beams = eighthNotes.length >= 2 ? Beam.generateBeams(eighthNotes) : [];

        new Formatter().joinVoices([voice]).format([voice], 320);
        voice.draw(context, stave);
        beams.forEach((b: any) => b.setContext(context).draw());

        // Si el ejemplo tiene ligadura (Tie), la dibujamos
        if (item.tieIndices) {
            const [firstIdx, secondIdx] = item.tieIndices;
            const tie = new StaveTie({
                firstNote: vexNotes[firstIdx],
                lastNote: vexNotes[secondIdx],
                firstIndexes: [0],
                lastIndexes: [0],
            });
            tie.setContext(context).draw();
        }
    }, [item]);

    // Limpiar timers al desmontar
    useEffect(() => {
        return () => {
            timeoutsRef.current.forEach(clearTimeout);
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                audioCtxRef.current.close().catch(console.warn);
            }
        };
    }, []);

    // Reproductor demostrativo (4 pulsos de metrónomo + notas/silencios)
    const handlePlayDemo = async () => {
        if (isPlayingDemo) return;
        setIsPlayingDemo(true);
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];

        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        if (ctx.state === "suspended") await ctx.resume();

        const bpm = 75;
        const beatSec = 60 / bpm; // 0.8s por pulso

        // 1. Programamos los 4 clics del metrónomo (1, 2, 3, 4)
        for (let b = 0; b < 4; b++) {
            const clickStart = ctx.currentTime + b * beatSec;
            const clickOsc = ctx.createOscillator();
            const clickGain = ctx.createGain();
            clickOsc.frequency.value = b === 0 ? 1000 : 750;
            clickGain.gain.setValueAtTime(0.15, clickStart);
            clickGain.gain.exponentialRampToValueAtTime(0.001, clickStart + 0.035);
            clickOsc.connect(clickGain);
            clickGain.connect(ctx.destination);
            clickOsc.start(clickStart);
            clickOsc.stop(clickStart + 0.035);

            const tId = setTimeout(() => setActiveBeat(b + 1), b * beatSec * 1000);
            timeoutsRef.current.push(tId);
        }

        // 2. Programamos las notas (o silencios si freq === 0)
        let accumulatedBeats = 0;
        item.audioPulses.forEach((pulse) => {
            if (pulse.freq > 0) {
                const noteStart = ctx.currentTime + accumulatedBeats * beatSec;
                const noteDur = pulse.beats * beatSec * 0.92;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle"; // Timbre suave tipo piano/flauta didáctico
                osc.frequency.value = pulse.freq;

                gain.gain.setValueAtTime(0.01, noteStart);
                gain.gain.linearRampToValueAtTime(0.3, noteStart + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.008, noteStart + noteDur);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(noteStart);
                osc.stop(noteStart + noteDur);
            }
            accumulatedBeats += pulse.beats;
        });

        const endTimer = setTimeout(() => {
            setIsPlayingDemo(false);
            setActiveBeat(null);
            if (ctx.state !== "closed") {
                ctx.close().catch(console.warn);
            }
        }, 4 * beatSec * 1000 + 100);
        timeoutsRef.current.push(endTimer);
    };

    return (
        <div className="flex h-full flex-col justify-between gap-4 rounded-[1.5rem_2rem_1.4rem_1.8rem] border border-pink-200/80 bg-rose-50/50 p-5 shadow-lg shadow-pink-100/40 dark:border-pink-500/20 dark:bg-slate-950/40 dark:shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h3 className="font-display text-2xl text-rose-950 dark:text-pink-50">{item.name}</h3>
                    <p className="mt-0.5 text-xs font-medium text-rose-500 dark:text-pink-300">{item.symbolDesc}</p>
                </div>
                <span className="rounded-full border border-pink-200 bg-white/80 px-3 py-1 text-[11px] font-bold text-rose-800 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-100">
                    {item.beatsText}
                </span>
            </div>

            <p className="text-xs leading-relaxed text-rose-900/65 dark:text-pink-100/60">{item.explanation}</p>

            <div className="mx-auto w-fit max-w-full overflow-hidden rounded-[1.2rem] border border-rose-100 bg-[#FFFDFB]">
                <div
                    ref={containerRef}
                    className="[&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
                />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                    <span className="mr-1 text-[11px] font-semibold text-rose-400">Pulsos:</span>
                    {[1, 2, 3, 4].map((beatNum) => (
                        <span
                            key={beatNum}
                            className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold transition-all ${
                                activeBeat === beatNum
                                    ? "scale-110 bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950 shadow-lg shadow-pink-300/50"
                                    : "border border-pink-200/80 bg-white text-rose-700 dark:border-pink-500/25 dark:bg-slate-900 dark:text-pink-100"
                            }`}
                        >
                            {beatNum}
                        </span>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handlePlayDemo}
                    disabled={isPlayingDemo}
                    className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 text-xs font-bold text-rose-950 shadow-md shadow-pink-300/40 transition disabled:from-amber-200 disabled:to-orange-200"
                >
                    {isPlayingDemo ? "🔊 Escuchando..." : "▶ Escuchar ejemplo"}
                </button>
            </div>
        </div>
    );
}