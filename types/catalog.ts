// types/catalog.ts
import { DifficultyLevel, ClefType } from "./exercise";

export type MusicGenre = "anime" | "clasica" | "rock" | "videojuegos" | "popular";
export type InstrumentType = "piano" | "violin" | "flute";

export const CATALOG_VERSION = "1.1";


export interface SheetMusicItem {
    id: string;
    title: string;
    composer: string;
    level: DifficultyLevel; // "principiante" | "intermedio" | "avanzado"
    genre: MusicGenre;
    instrument: InstrumentType; // "piano" | "violin" | "flute"
    clef: ClefType | "grand"; // "treble", "bass" o "grand" (ambas manos)
    timeSignature: "4/4" | "3/4" | "2/4" | "6/8";
    bpm: number;
    measuresCount: number;
    scoreFile: string;
}