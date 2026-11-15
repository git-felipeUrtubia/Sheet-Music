"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import Vex from "vexflow";
import type { AccidentalGlyph, TheoryExampleItem, TheoryVexNote } from "@/data/theoryLessons";

interface TheoryInteractiveCardProps {
  item: TheoryExampleItem;
}

const SHARP_ORDER = ["f", "c", "g", "d", "a", "e", "b"];
const FLAT_ORDER = ["b", "e", "a", "d", "g", "c", "f"];

const KEY_SIGNS: Record<string, { count: number; kind: "sharp" | "flat" }> = {
  C: { count: 0, kind: "sharp" },
  G: { count: 1, kind: "sharp" },
  D: { count: 2, kind: "sharp" },
  A: { count: 3, kind: "sharp" },
  E: { count: 4, kind: "sharp" },
  B: { count: 5, kind: "sharp" },
  "F#": { count: 6, kind: "sharp" },
  F: { count: 1, kind: "flat" },
  Bb: { count: 2, kind: "flat" },
  Eb: { count: 3, kind: "flat" },
  Ab: { count: 4, kind: "flat" },
  Db: { count: 5, kind: "flat" },
  Gb: { count: 6, kind: "flat" },
  Am: { count: 0, kind: "sharp" },
  Em: { count: 1, kind: "sharp" },
  Bm: { count: 2, kind: "sharp" },
  "F#m": { count: 3, kind: "sharp" },
  "C#m": { count: 4, kind: "sharp" },
  Dm: { count: 1, kind: "flat" },
  Gm: { count: 2, kind: "flat" },
  Cm: { count: 3, kind: "flat" },
};

function parsePitch(key: string): { letter: string; acc: string | null } {
  const name = key.split("/")[0];
  const suffix = name.slice(1);
  return { letter: name[0], acc: suffix || null };
}

function expectedAccidental(keySignature: string | undefined, letter: string): string | null {
  if (!keySignature) return null;
  const spec = KEY_SIGNS[keySignature];
  if (!spec || spec.count === 0) return null;
  const order = spec.kind === "sharp" ? SHARP_ORDER : FLAT_ORDER;
  if (!order.slice(0, spec.count).includes(letter)) return null;
  return spec.kind === "sharp" ? "#" : "b";
}

function resolveAccidental(pitch: string, explicit: string | null, keySignature?: string): string | null {
  const { letter, acc } = parsePitch(pitch);
  const written = explicit ?? acc;
  const expected = expectedAccidental(keySignature, letter);
  if (written === expected) return null;
  if (!written && expected) return "n";
  return written;
}

function accidentalsFor(note: TheoryVexNote, keySignature?: string): (string | null)[] {
  if (note.accidentals?.length) return note.accidentals;
  return note.keys.map((key, index) => {
    const explicit = index === 0 ? note.accidental ?? null : null;
    return resolveAccidental(key, explicit, keySignature);
  });
}

function durationBeats(note: TheoryVexNote): number {
  if (typeof note.beats === "number") return note.beats;
  const dotCount = (note.duration.match(/d/g) || []).length;
  const clean = note.duration.replace(/d/g, "");
  let beats = 1;
  if (clean.includes("w")) beats = 4;
  else if (clean.includes("h")) beats = 2;
  else if (clean.includes("q")) beats = 1;
  else if (clean.includes("8")) beats = 0.5;
  else if (clean.includes("16")) beats = 0.25;
  if (dotCount === 1) beats *= 1.5;
  if (dotCount >= 2) beats *= 1.75;
  return beats;
}

function pulseFreqs(freq: number | number[]): number[] {
  const list = Array.isArray(freq) ? freq : [freq];
  return list.filter((value) => value > 0);
}

export default function TheoryInteractiveCard({ item }: TheoryInteractiveCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [activeBeat, setActiveBeat] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pulseCount = item.pulseCount ?? 4;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const flow = ((Vex as unknown as { Flow?: typeof Vex }).Flow || Vex) as any;
    const { Renderer, Stave, StaveNote, Voice, Formatter, Beam, Dot, Accidental, StaveTie, Tuplet, StaveConnector } = flow;

    const buildNotes = (specs: TheoryVexNote[], clef: "treble" | "bass") => {
      const notes = specs.map((spec) => {
        const dotCount = (spec.duration.match(/d/g) || []).length;
        const cleanDuration = spec.duration.replace(/d/g, "");
        const note = new StaveNote({
          clef,
          keys: spec.keys,
          duration: cleanDuration,
        });
        for (let dot = 0; dot < dotCount; dot += 1) {
          Dot.buildAndAttach([note], { all: true });
        }
        accidentalsFor(spec, item.keySignature).forEach((acc, index) => {
          if (acc) note.addModifier(new Accidental(acc as AccidentalGlyph), index);
        });
        return note;
      });
      return notes;
    };

    const drawVoice = (
      context: any,
      stave: any,
      notes: any[],
      beams: any[],
      tuplet?: any,
    ) => {
      const totalBeats = (item.grandStaff ? item.grandStaff.treble : item.vexNotes).reduce(
        (sum, note) => sum + durationBeats(note),
        0,
      );
      const voice = new Voice({ numBeats: Math.max(totalBeats, 1), beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(notes);
      const noteArea = Math.max(160, stave.getWidth() - (stave.getNoteStartX() - stave.getX()) - 16);
      new Formatter().joinVoices([voice]).format([voice], noteArea);
      voice.draw(context, stave);
      beams.forEach((beam) => beam.setContext(context).draw());
      tuplet?.setContext(context).draw();
      return voice;
    };

    if (item.grandStaff) {
      const width = 520;
      const height = 250;
      const renderer = new Renderer(container, Renderer.Backends.SVG);
      renderer.resize(width, height);
      const context = renderer.getContext();
      const treble = new Stave(10, 16, width - 24);
      const bass = new Stave(10, 126, width - 24);
      treble.addClef("treble");
      bass.addClef("bass");
      if (item.keySignature) {
        treble.addKeySignature(item.keySignature);
        bass.addKeySignature(item.keySignature);
      }
      treble.addTimeSignature(item.timeSignature);
      bass.addTimeSignature(item.timeSignature);
      treble.setContext(context).draw();
      bass.setContext(context).draw();
      if (StaveConnector) {
        const brace = new StaveConnector(treble, bass);
        brace.setType("brace").setContext(context).draw();
        const left = new StaveConnector(treble, bass);
        left.setType("singleLeft").setContext(context).draw();
      }

      const trebleNotes = buildNotes(item.grandStaff.treble, "treble");
      const bassNotes = buildNotes(item.grandStaff.bass, "bass");
      const trebleVoice = new Voice({ numBeats: 4, beatValue: 4 });
      const bassVoice = new Voice({ numBeats: 4, beatValue: 4 });
      trebleVoice.setStrict(false);
      bassVoice.setStrict(false);
      trebleVoice.addTickables(trebleNotes);
      bassVoice.addTickables(bassNotes);
      const formatter = new Formatter();
      formatter.joinVoices([trebleVoice]);
      formatter.joinVoices([bassVoice]);
      const noteArea = Math.max(180, treble.getWidth() - (treble.getNoteStartX() - treble.getX()) - 16);
      formatter.format([trebleVoice, bassVoice], noteArea);
      trebleVoice.draw(context, treble);
      bassVoice.draw(context, bass);
      const trebleEighths = trebleNotes.filter((note: any) => note.getDuration() === "8");
      if (trebleEighths.length >= 2) {
        Beam.generateBeams(trebleEighths).forEach((beam: any) => beam.setContext(context).draw());
      }
      return;
    }

    const width = item.vexNotes.length > 6 ? 560 : 460;
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, 150);
    const context = renderer.getContext();
    const stave = new Stave(10, 18, width - 20);
    stave.addClef(item.clef);
    if (item.keySignature) stave.addKeySignature(item.keySignature);
    stave.addTimeSignature(item.timeSignature);
    stave.setContext(context).draw();

    const vexNotes = buildNotes(item.vexNotes, item.clef);
    const eighths = vexNotes.filter((note: any) => note.getDuration() === "8");
    const beams = eighths.length >= 2 ? Beam.generateBeams(eighths) : [];
    const tuplet = item.tuplet ? new Tuplet(vexNotes.slice(item.tuplet[0], item.tuplet[1] + 1)) : null;
    drawVoice(context, stave, vexNotes, beams, tuplet);

    if (item.tieIndices && StaveTie) {
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

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const handlePlayDemo = async () => {
    if (isPlayingDemo) return;
    setIsPlayingDemo(true);
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    const bpm = 75;
    const beatSec = 60 / bpm;
    const clickUnit = item.clickUnit ?? 1;

    for (let beat = 0; beat < pulseCount; beat += 1) {
      const clickStart = ctx.currentTime + beat * beatSec * clickUnit;
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.frequency.value = beat === 0 ? 1000 : 750;
      clickGain.gain.setValueAtTime(0.15, clickStart);
      clickGain.gain.exponentialRampToValueAtTime(0.001, clickStart + 0.035);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(clickStart);
      clickOsc.stop(clickStart + 0.035);

      const mark = window.setTimeout(() => setActiveBeat(beat + 1), beat * beatSec * clickUnit * 1000);
      timeoutsRef.current.push(mark);
    }

    let accumulatedBeats = 0;
    item.audioPulses.forEach((pulse) => {
      pulseFreqs(pulse.freq).forEach((freq) => {
        const noteStart = ctx.currentTime + accumulatedBeats * beatSec;
        const noteDur = Math.max(0.08, pulse.beats * beatSec * 0.92);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.01, noteStart);
        gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.008, noteStart + noteDur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + noteDur);
      });
      accumulatedBeats += pulse.beats;
    });

    const span = Math.max(accumulatedBeats, pulseCount * clickUnit);
    const endTimer = window.setTimeout(() => {
      setIsPlayingDemo(false);
      setActiveBeat(null);
      if (ctx.state !== "closed") ctx.close().catch(() => undefined);
    }, span * beatSec * 1000 + 120);
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

      <div className="mx-auto w-full max-w-full overflow-x-auto rounded-[1.2rem] border border-rose-100 bg-[#FFFDFB]">
        <div ref={containerRef} className="[&_svg]:block [&_svg]:h-auto" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-semibold text-rose-400">Pulsos:</span>
          {Array.from({ length: pulseCount }, (_, index) => index + 1).map((beatNum) => (
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
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 text-xs font-bold text-rose-950 shadow-md shadow-pink-300/40 transition disabled:from-amber-200 disabled:to-orange-200"
        >
          {isPlayingDemo ? (
            <Volume2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" strokeWidth={1.75} />
          )}
          {isPlayingDemo ? "Escuchando..." : "Escuchar ejemplo"}
        </button>
      </div>
    </div>
  );
}
