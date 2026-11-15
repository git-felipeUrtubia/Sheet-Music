// types/exercise.ts
export type DifficultyLevel = "principiante" | "intermedio" | "avanzado";
export type ClefType = "treble" | "bass"; // Sol o Fa
import type { SheetMusicItem } from "./catalog";
import type { MusicalScale } from "@/data/scales";

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

export interface ElectronProgressRow {
  exerciseId: string;
  completed: number | boolean;
  bestBpm: number;
  updatedAt: string;
}

export interface ElectronScaleProgressRow {
  scaleId: string;
  mastered: number | boolean;
  bestBpm: number;
  updatedAt: string;
}

export interface ElectronDataBridge {
  getExercisesByLevel: (level: DifficultyLevel) => Promise<Exercise[]>;
  saveProgress: (exerciseId: string, bpm: number) => Promise<{ ok: boolean }>;
  getCatalog: () => Promise<SheetMusicItem[]>;
  getScoreXml: (scoreId: string) => Promise<string | null>;
  getProgress?: () => Promise<ElectronProgressRow[]>;
  getScales?: () => Promise<MusicalScale[]>;
  saveScaleProgress?: (scaleId: string, bpm: number, mastered: boolean) => Promise<{ ok: boolean }>;
  getScaleProgress?: () => Promise<ElectronScaleProgressRow[]>;
}

declare global {
  interface Window {
    electronDB?: ElectronDataBridge;
    electronAPI?: ElectronDataBridge;
  }
}