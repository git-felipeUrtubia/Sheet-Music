// types/exercise.ts
export type DifficultyLevel = "principiante" | "intermedio" | "avanzado";
export type ClefType = "treble" | "bass"; // Sol o Fa
import type { SheetMusicItem } from "./catalog";

export interface NoteItem {
  pitch: string;     // Ej: "c/4", "d/4" (formato VexFlow)
  duration: string;  // Ej: "w" (redonda), "h" (blanca), "q" (negra)
  midiNote: number;  // Ej: 60 (Do central) -> ideal para comparar fácil con tu detector
}

export interface Exercise {
  id: string;
  title: string;
  level: DifficultyLevel;
  clef: ClefType;
  timeSignature: "4/4" | "3/4" | "2/4";
  notes: NoteItem[];
}

declare global {
  interface Window {
    electronDB?: {
      getExercisesByLevel: (level: DifficultyLevel) => Promise<Exercise[]>;
      saveProgress: (exerciseId: string, bpm: number) => Promise<{ ok: boolean }>;
      getCatalog: () => Promise<SheetMusicItem[]>;
      getScoreXml: (scoreId: string) => Promise<string | null>;
    };
  }
}