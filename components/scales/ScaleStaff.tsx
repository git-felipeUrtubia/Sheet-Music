"use client";

import { useEffect, useRef, useState } from "react";
import Vex from "vexflow";
import type { MusicalScale, ScaleDegree } from "@/data/scales";

type Direction = "asc" | "desc" | "both";
export type ScaleRhythm = "quarter" | "eighth" | "triplet" | "sixteenth";

const RHYTHM_DURATION: Record<ScaleRhythm, string> = {
  quarter: "q",
  eighth: "8",
  triplet: "8",
  sixteenth: "16",
};

/** Agrupa sin dejar una corchea o semicorchea sola al final. */
function groupSizes(count: number, size: number): number[] {
  const sizes: number[] = [];
  let left = count;
  while (left > 0) {
    if (left === size + 1) {
      sizes.push(size - 1, 2);
      break;
    }
    const take = Math.min(size, left);
    sizes.push(take);
    left -= take;
  }
  return sizes.filter((value) => value > 0);
}

function tripletSizes(count: number): number[] {
  const sizes: number[] = [];
  let left = count;
  while (left > 0) {
    if (left === 4) {
      sizes.push(2, 2);
      break;
    }
    if (left < 3) {
      sizes.push(left);
      break;
    }
    sizes.push(3);
    left -= 3;
  }
  return sizes;
}

function transposeDown(note: ScaleDegree): ScaleDegree {
  return {
    ...note,
    octave: note.octave - 1,
    midi: note.midi - 12,
    pitch: note.pitch.replace(/\/(\d+)$/, (_, octave: string) => `/${Number(octave) - 1}`),
  };
}

function sequenceFor(scale: MusicalScale, direction: Direction): ScaleDegree[] {
  if (direction === "asc") return scale.ascending;
  if (direction === "desc") return scale.descending;
  return [...scale.ascending, ...scale.descending.slice(1)];
}

function printedAccidental(scale: MusicalScale, note: ScaleDegree): string | null {
  const inSignature = scale.signatureLetters.includes(note.letter);
  const expected = !inSignature || scale.accidentalKind === "none" ? 0 : scale.accidentalKind === "sharp" ? 1 : -1;
  if (note.accidental === expected) return null;
  if (note.accidental === 0) return "n";
  if (note.accidental === 1) return "#";
  if (note.accidental === 2) return "##";
  if (note.accidental === -1) return "b";
  if (note.accidental === -2) return "bb";
  return null;
}

export default function ScaleStaff({
  scale,
  direction,
  rhythm,
  activeIndex,
}: {
  scale: MusicalScale;
  direction: Direction;
  rhythm: ScaleRhythm;
  activeIndex: number | null;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [staffWidth, setStaffWidth] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setStaffWidth(frame.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || staffWidth < 80) return;
    container.innerHTML = "";

    const notes = sequenceFor(scale, direction);
    const flow = ((Vex as unknown as { Flow?: typeof Vex }).Flow || Vex) as any;
    const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Annotation, StaveConnector, BarNote, Beam, Tuplet } =
      flow;

    const width = staffWidth;
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(width, 300);
    const context = renderer.getContext();

    const treble = new Stave(8, 28, width - 16);
    const bass = new Stave(8, 156, width - 16);
    treble.addClef("treble").addKeySignature(scale.vexKey).addTimeSignature("4/4");
    bass.addClef("bass").addKeySignature(scale.vexKey).addTimeSignature("4/4");
    treble.setContext(context).draw();
    bass.setContext(context).draw();

    if (StaveConnector) {
      new StaveConnector(treble, bass).setType("brace").setContext(context).draw();
      new StaveConnector(treble, bass).setType("singleLeft").setContext(context).draw();
    }

    const makeNote = (note: ScaleDegree, clef: "treble" | "bass", hand: "fingerRH" | "fingerLH", index: number) => {
      const staveNote = new StaveNote({
        clef,
        keys: [note.pitch],
        duration: RHYTHM_DURATION[rhythm],
      });
      if (rhythm !== "quarter") {
        staveNote.setStemDirection(clef === "bass" ? -1 : 1);
      }
      const accidental = printedAccidental(scale, note);
      if (accidental) staveNote.addModifier(new Accidental(accidental), 0);
      if (Annotation?.VerticalJustify) {
        const finger = new Annotation(String(note[hand]));
        finger.setVerticalJustification(
          hand === "fingerRH" ? Annotation.VerticalJustify.BOTTOM : Annotation.VerticalJustify.TOP,
        );
        staveNote.addModifier(finger, 0);
      }
      if (activeIndex !== null && index < activeIndex) {
        staveNote.setStyle({ fillStyle: "#059669", strokeStyle: "#059669" });
      } else if (index === activeIndex) {
        staveNote.setStyle({ fillStyle: "#be185d", strokeStyle: "#be185d" });
      }
      return staveNote;
    };

    const trebleGroups: any[][] = [[], []];
    const bassGroups: any[][] = [[], []];
    const trebleTickables: unknown[] = [];
    const bassTickables: unknown[] = [];
    const splitAt = direction === "both" ? scale.ascending.length : notes.length + 1;
    notes.forEach((note, index) => {
      const group = index < splitAt ? 0 : 1;
      if (index === splitAt && BarNote) {
        trebleTickables.push(new BarNote());
        bassTickables.push(new BarNote());
      }
      const trebleNote = makeNote(note, "treble", "fingerRH", index);
      const bassNote = makeNote(transposeDown(note), "bass", "fingerLH", index);
      trebleGroups[group].push(trebleNote);
      bassGroups[group].push(bassNote);
      trebleTickables.push(trebleNote);
      bassTickables.push(bassNote);
    });

    const beatValue = rhythm === "quarter" ? 1 : rhythm === "sixteenth" ? 0.25 : rhythm === "triplet" ? 1 / 3 : 0.5;
    const trebleVoice = new Voice({ numBeats: Math.max(notes.length * beatValue, 1), beatValue: 4 });
    const bassVoice = new Voice({ numBeats: Math.max(notes.length * beatValue, 1), beatValue: 4 });
    trebleVoice.setStrict(false);
    bassVoice.setStrict(false);
    trebleVoice.addTickables(trebleTickables);
    bassVoice.addTickables(bassTickables);

    const beams: any[] = [];
    const tuplets: any[] = [];
    const attachBeams = (groups: any[][]) => {
      groups.forEach((group) => {
        if (!Beam || group.length < 2 || rhythm === "quarter") return;
        const sizes = rhythm === "triplet" ? tripletSizes(group.length) : groupSizes(group.length, rhythm === "sixteenth" ? 4 : 4);
        let cursor = 0;
        sizes.forEach((size) => {
          const slice = group.slice(cursor, cursor + size);
          cursor += size;
          if (slice.length >= 2) beams.push(new Beam(slice, false));
          if (rhythm === "triplet" && slice.length === 3 && Tuplet) {
            tuplets.push(new Tuplet(slice, { numNotes: 3, notesOccupied: 2 }));
          }
        });
      });
    };
    attachBeams(trebleGroups);
    attachBeams(bassGroups);

    const formatter = new Formatter();
    formatter.joinVoices([trebleVoice]);
    formatter.joinVoices([bassVoice]);
    const noteArea = Math.max(180, treble.getWidth() - (treble.getNoteStartX() - treble.getX()) - 8);
    formatter.format([trebleVoice, bassVoice], noteArea);
    trebleVoice.draw(context, treble);
    bassVoice.draw(context, bass);
    beams.forEach((beam) => beam.setContext(context).draw());
    tuplets.forEach((tuplet) => tuplet.setContext(context).draw());
  }, [scale, direction, rhythm, activeIndex, staffWidth]);

  return (
    <div ref={frameRef} className="w-full overflow-hidden rounded-[1.2rem] border border-rose-100 bg-[#FFFDFB]">
      <div ref={containerRef} className="min-h-[180px] [&_svg]:block [&_svg]:max-w-full" />
    </div>
  );
}
