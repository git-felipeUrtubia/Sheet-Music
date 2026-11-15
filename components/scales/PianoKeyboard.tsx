"use client";

const START_MIDI = 48;
const END_MIDI = 84;

function isBlack(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

export interface PianoMark {
  midi: number;
  finger?: number;
  state: "idle" | "active" | "passed";
}

export default function PianoKeyboard({ marks }: { marks: PianoMark[] }) {
  const whites: number[] = [];
  const whiteIndex = new Map<number, number>();
  for (let midi = START_MIDI; midi <= END_MIDI; midi += 1) {
    if (!isBlack(midi)) {
      whiteIndex.set(midi, whites.length);
      whites.push(midi);
    }
  }

  const markByMidi = new Map(marks.map((mark) => [mark.midi, mark]));
  const whiteWidth = 28;
  const width = whites.length * whiteWidth;

  const blackKeys: number[] = [];
  for (let midi = START_MIDI; midi <= END_MIDI; midi += 1) {
    if (isBlack(midi)) blackKeys.push(midi);
  }

  const keyClass = (midi: number, black: boolean) => {
    const mark = markByMidi.get(midi);
    if (mark?.state === "active") {
      return "bg-gradient-to-b from-pink-300 to-rose-400 text-rose-950 shadow-[0_0_0_2px_rgba(190,18,60,0.45)]";
    }
    if (mark?.state === "passed") {
      return black
        ? "bg-emerald-700 text-white"
        : "bg-emerald-100 text-emerald-950";
    }
    if (mark) {
      return black
        ? "bg-rose-950 text-pink-50"
        : "bg-pink-100 text-rose-950";
    }
    return black ? "bg-slate-900 text-white" : "bg-white text-rose-950";
  };

  return (
    <div className="overflow-x-auto rounded-[1.2rem] border border-rose-100 bg-[#FFFDFB] p-3 dark:border-pink-500/15">
      <div className="relative h-36" style={{ width }}>
        {whites.map((midi, index) => {
          const mark = markByMidi.get(midi);
          return (
            <div
              key={midi}
              className={`absolute top-0 flex h-36 flex-col items-center justify-end border border-rose-200/80 pb-1 ${keyClass(midi, false)}`}
              style={{ left: index * whiteWidth, width: whiteWidth - 1 }}
            >
              {mark?.finger ? <span className="text-[10px] font-bold">{mark.finger}</span> : null}
            </div>
          );
        })}
        {blackKeys.map((midi) => {
          let previous = midi - 1;
          while (isBlack(previous)) previous -= 1;
          const index = whiteIndex.get(previous) ?? 0;
          const mark = markByMidi.get(midi);
          return (
            <div
              key={midi}
              className={`absolute top-0 z-10 flex h-20 items-end justify-center rounded-b-md pb-1 ${keyClass(midi, true)}`}
              style={{ left: (index + 1) * whiteWidth - 9, width: 16 }}
            >
              {mark?.finger ? <span className="text-[9px] font-bold">{mark.finger}</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
