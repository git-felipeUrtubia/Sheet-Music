// types/settings.ts

export type NotationSystem = "english" | "solfege";

export interface AppSettings {
  selectedMidiId: string;
  notation: NotationSystem;
  metronomeVolume: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  selectedMidiId: "default",
  notation: "english",
  metronomeVolume: 75,
};

const SETTINGS_KEY = "sheetmusic_settings";
const LEGACY_SETTINGS_KEY = "sheet_music_settings";

const SOLFEGE_MAP: Record<string, string> = {
  C: "Do", "C#": "Do#", Db: "Reb", D: "Re", "D#": "Re#", Eb: "Mib",
  E: "Mi", F: "Fa", "F#": "Fa#", Gb: "Solb", G: "Sol", "G#": "Sol#",
  Ab: "Lab", A: "La", "A#": "La#", Bb: "Sib", B: "Si",
};

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    if (!localStorage.getItem(SETTINGS_KEY)) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("app-settings-updated"));
}

export function formatNoteBySystem(
  note: string | null | undefined,
  system: NotationSystem = "english"
): string {
  if (!note) return "—";

  const clean = note.replace("/", "").trim();
  const match = clean.match(/^([a-gA-G][#b]?)(-?\d+)?$/);
  if (!match) return note;

  const rawPitch = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  const octave = match[2] ?? "";

  if (system === "solfege") {
    const translated = SOLFEGE_MAP[rawPitch] || rawPitch;
    return `${translated}${octave}`;
  }

  return `${rawPitch}${octave}`;
}