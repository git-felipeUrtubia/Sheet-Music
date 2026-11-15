import { EXERCISES_DATA } from "@/data/exercises";
import { SHEET_MUSIC_CATALOG } from "@/data/catalog";
import { SCALES, type MusicalScale } from "@/data/scales";
import { THEORY_CHAPTERS, type TheoryChapter } from "@/data/theoryLessons";
import type { SheetMusicItem, InstrumentType, MusicGenre } from "@/types/catalog";
import type { DifficultyLevel, ElectronDataBridge, Exercise } from "@/types/exercise";

export const PROGRESS_KEY = "sheetmusic_progress";
export const FAVORITES_KEY = "sheetmusic_favorites";
export const SCALE_PROGRESS_KEY = "sheetmusic_scale_progress";

export interface ProgressEntry {
  completed: boolean;
  bestBpm: number;
  updatedAt: string;
}

export interface UserProgress {
  entries: Record<string, ProgressEntry>;
  stats: {
    completed: number;
    bestBpm: number;
  };
}

export interface ScaleProgressEntry {
  mastered: boolean;
  bestBpm: number;
  updatedAt: string;
}

export interface WebDatabase {
  generatedAt?: string;
  scores: SheetMusicItem[];
  exercises: Exercise[];
  lessons: TheoryChapter[];
  scales?: MusicalScale[];
}

export interface ScoreQuery {
  instrument?: "todos" | InstrumentType;
  level?: "todos" | DifficultyLevel;
  genre?: "todos" | MusicGenre;
  query?: string;
}

const EMPTY_PROGRESS: UserProgress = {
  entries: {},
  stats: { completed: 0, bestBpm: 0 },
};

let webDatabasePromise: Promise<WebDatabase> | null = null;

export function getDesktopBridge(): ElectronDataBridge | null {
  if (typeof window === "undefined") return null;
  return window.electronAPI ?? window.electronDB ?? null;
}

export function isDesktopApp(): boolean {
  return getDesktopBridge() !== null;
}

function statsFromEntries(entries: Record<string, ProgressEntry>): UserProgress["stats"] {
  const list = Object.values(entries);
  return {
    completed: list.filter((item) => item.completed).length,
    bestBpm: list.reduce((max, item) => Math.max(max, item.bestBpm || 0), 0),
  };
}

function normalizeProgress(value: unknown): UserProgress {
  if (!value || typeof value !== "object") return EMPTY_PROGRESS;

  const record = value as { entries?: unknown; stats?: unknown };
  const source =
    record.entries && typeof record.entries === "object"
      ? (record.entries as Record<string, Partial<ProgressEntry>>)
      : (value as Record<string, Partial<ProgressEntry>>);

  const entries: Record<string, ProgressEntry> = {};
  Object.entries(source).forEach(([id, item]) => {
    if (!item || typeof item !== "object" || !("completed" in item || "bestBpm" in item)) return;
    entries[id] = {
      completed: Boolean(item.completed),
      bestBpm: Number(item.bestBpm) || 0,
      updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : "",
    };
  });

  return { entries, stats: statsFromEntries(entries) };
}

export function loadWebDatabase(): Promise<WebDatabase> {
  if (typeof window === "undefined") {
    return Promise.resolve({
      scores: SHEET_MUSIC_CATALOG,
      exercises: EXERCISES_DATA,
      lessons: THEORY_CHAPTERS,
      scales: SCALES,
    });
  }

  if (!webDatabasePromise) {
    webDatabasePromise = fetch("/web-db.json", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`web-db.json respondió ${response.status}`);
        }
        return response.json() as Promise<WebDatabase>;
      })
      .catch((error) => {
        webDatabasePromise = null;
        throw error;
      });
  }

  return webDatabasePromise;
}

export async function getCatalog(): Promise<SheetMusicItem[]> {
  const bridge = getDesktopBridge();
  if (bridge) {
    try {
      const rows = await bridge.getCatalog();
      if (rows?.length) return rows;
    } catch (error) {
      console.error("No se pudo leer el catálogo por IPC:", error);
    }
  }

  try {
    const database = await loadWebDatabase();
    if (database.scores?.length) return database.scores;
  } catch (error) {
    console.warn("Catálogo web no disponible, se usa el respaldo local.", error);
  }

  return SHEET_MUSIC_CATALOG;
}

export async function getExercisesByLevel(level: DifficultyLevel): Promise<Exercise[]> {
  const bridge = getDesktopBridge();
  if (bridge) {
    try {
      const rows = await bridge.getExercisesByLevel(level);
      if (rows?.length) return rows;
    } catch (error) {
      console.error("No se pudieron leer los ejercicios por IPC:", error);
    }
  }

  try {
    const database = await loadWebDatabase();
    const rows = (database.exercises || []).filter((exercise) => exercise.level === level);
    if (rows.length) return rows;
  } catch (error) {
    console.warn("Ejercicios web no disponibles, se usa el respaldo local.", error);
  }

  return EXERCISES_DATA.filter((exercise) => exercise.level === level);
}

export async function getScales(): Promise<MusicalScale[]> {
  const bridge = getDesktopBridge();
  if (bridge?.getScales) {
    try {
      const rows = await bridge.getScales();
      if (rows?.length) return rows;
    } catch (error) {
      console.error("No se pudieron leer las escalas por IPC:", error);
    }
  }

  try {
    const database = await loadWebDatabase();
    if (database.scales?.length) return database.scales;
  } catch (error) {
    console.warn("Escalas web no disponibles, se usa el respaldo local.", error);
  }

  return SCALES;
}

export async function getLessons(): Promise<TheoryChapter[]> {
  if (getDesktopBridge()) return THEORY_CHAPTERS;

  try {
    const database = await loadWebDatabase();
    if (database.lessons?.length) return database.lessons;
  } catch (error) {
    console.warn("Lecciones web no disponibles, se usa el respaldo local.", error);
  }

  return THEORY_CHAPTERS;
}

export function filterScores(scores: SheetMusicItem[], filters: ScoreQuery = {}): SheetMusicItem[] {
  const query = (filters.query ?? "").trim().toLowerCase();

  return scores.filter((item) => {
    const matchesInstrument =
      !filters.instrument || filters.instrument === "todos" || item.instrument === filters.instrument;
    const matchesLevel = !filters.level || filters.level === "todos" || item.level === filters.level;
    const matchesGenre = !filters.genre || filters.genre === "todos" || item.genre === filters.genre;
    const haystack = `${item.title} ${item.composer} ${item.instrument} ${item.genre} ${item.level}`.toLowerCase();
    const matchesQuery = query.length === 0 || haystack.includes(query);
    return matchesInstrument && matchesLevel && matchesGenre && matchesQuery;
  });
}

export function publicAssetUrl(assetPath: string): string {
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return encodeURI(assetPath);
}

export function isPdfAsset(assetPath: string): boolean {
  const cleanPath = assetPath.split("?")[0].toLowerCase();
  return cleanPath.endsWith(".pdf");
}

export async function loadScoreMarkup(score: Pick<SheetMusicItem, "id" | "scoreFile">): Promise<string> {
  const bridge = getDesktopBridge();
  if (bridge) {
    try {
      const xml = await bridge.getScoreXml(score.id);
      if (xml && xml.trim()) return xml;
    } catch (error) {
      console.error("No se pudo leer el MusicXML por IPC:", error);
    }
  }

  const response = await fetch(publicAssetUrl(score.scoreFile));
  if (!response.ok) {
    throw new Error(`No se pudo leer ${score.scoreFile}`);
  }
  return response.text();
}

export function readProgressFile(): UserProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return EMPTY_PROGRESS;
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return EMPTY_PROGRESS;
  }
}

function writeProgressFile(progress: UserProgress): void {
  const next: UserProgress = {
    entries: progress.entries,
    stats: statsFromEntries(progress.entries),
  };
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
}

export async function getProgress(): Promise<UserProgress> {
  const bridge = getDesktopBridge();
  if (bridge?.getProgress) {
    try {
      const rows = await bridge.getProgress();
      const entries: Record<string, ProgressEntry> = {};
      rows.forEach((row) => {
        entries[row.exerciseId] = {
          completed: Boolean(row.completed),
          bestBpm: Number(row.bestBpm) || 0,
          updatedAt: row.updatedAt || "",
        };
      });
      return { entries, stats: statsFromEntries(entries) };
    } catch (error) {
      console.error("No se pudo leer el progreso por IPC:", error);
    }
  }

  return readProgressFile();
}

export async function saveExerciseProgress(exerciseId: string, bpm: number): Promise<{ ok: boolean }> {
  const bridge = getDesktopBridge();
  if (bridge) {
    return bridge.saveProgress(exerciseId, bpm);
  }

  const progress = readProgressFile();
  const previous = progress.entries[exerciseId];
  progress.entries[exerciseId] = {
    completed: true,
    bestBpm: Math.max(previous?.bestBpm ?? 0, bpm),
    updatedAt: new Date().toISOString(),
  };
  writeProgressFile(progress);
  return { ok: true };
}

function readScaleProgress(): Record<string, ScaleProgressEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(SCALE_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<ScaleProgressEntry>>;
    const entries: Record<string, ScaleProgressEntry> = {};
    Object.entries(parsed).forEach(([id, item]) => {
      if (!item || typeof item !== "object") return;
      entries[id] = {
        mastered: Boolean(item.mastered),
        bestBpm: Number(item.bestBpm) || 0,
        updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : "",
      };
    });
    return entries;
  } catch {
    return {};
  }
}

export async function getScaleProgress(): Promise<Record<string, ScaleProgressEntry>> {
  const bridge = getDesktopBridge();
  if (bridge?.getScaleProgress) {
    try {
      const rows = await bridge.getScaleProgress();
      const entries: Record<string, ScaleProgressEntry> = {};
      rows.forEach((row) => {
        entries[row.scaleId] = {
          mastered: Boolean(row.mastered),
          bestBpm: Number(row.bestBpm) || 0,
          updatedAt: row.updatedAt || "",
        };
      });
      return entries;
    } catch (error) {
      console.error("No se pudo leer el progreso de escalas por IPC:", error);
    }
  }
  return readScaleProgress();
}

export async function saveScaleProgress(
  scaleId: string,
  bpm: number,
  mastered: boolean,
): Promise<{ ok: boolean }> {
  const bridge = getDesktopBridge();
  if (bridge?.saveScaleProgress) {
    return bridge.saveScaleProgress(scaleId, bpm, mastered);
  }

  const entries = readScaleProgress();
  const previous = entries[scaleId];
  entries[scaleId] = {
    mastered,
    bestBpm: Math.max(previous?.bestBpm ?? 0, bpm),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(SCALE_PROGRESS_KEY, JSON.stringify(entries));
  return { ok: true };
}

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(scoreId: string): string[] {
  const current = getFavorites();
  const next = current.includes(scoreId)
    ? current.filter((id) => id !== scoreId)
    : [...current, scoreId];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}
