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
        <div className="bg-[#0A1128] border border-blue-900/60 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-extrabold text-[#F1F5F9]">{item.name}</h3>
                    <p className="text-xs text-blue-300 font-medium mt-0.5">{item.symbolDesc}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-400/30 text-[11px] font-bold text-blue-300">
                    {item.beatsText}
                </span>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">{item.explanation}</p>

            {/* Pentagrama de VexFlow */}
            <div className="w-full bg-[#F8FAFC] rounded-xl p-2 flex items-center justify-center overflow-x-auto border-2 border-blue-900/30">
                <div ref={containerRef} className="w-[440px] h-[140px]" />
            </div>

            {/* Barra inferior con contador de pulsos y botón de audio */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-[#94A3B8] mr-1">Pulsos:</span>
                    {[1, 2, 3, 4].map((beatNum) => (
                        <span
                            key={beatNum}
                            className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all ${activeBeat === beatNum
                                    ? "bg-emerald-500 text-[#0A1128] scale-110 shadow-[0_0_10px_#10b981]"
                                    : "bg-[#111C3D] text-[#94A3B8] border border-blue-900/50"
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-amber-600 text-xs font-bold text-white cursor-pointer transition-all shadow-md"
                >
                    {isPlayingDemo ? "🔊 Escuchando..." : "▶ Escuchar ejemplo"}
                </button>
            </div>
        </div>
    );
}