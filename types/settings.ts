// types/settings.ts

export type NotationSystem = "english" | "solfege"; // C, D, E vs Do, Re, Mi

export interface AppSettings {
  micEnabled: boolean;
  selectedMicId: string;
  micSensitivity: number; // Rango de 1 a 10
  notation: NotationSystem;
  metronomeVolume: number; // Rango de 0 a 100
}

export const DEFAULT_SETTINGS: AppSettings = {
  micEnabled: true,
  selectedMicId: "default",
  micSensitivity: 5,
  notation: "english",
  metronomeVolume: 75,
};

const SOLFEGE_MAP: Record<string, string> = {
  C: "Do",
  "C#": "Do#",
  Db: "Reb",
  D: "Re",
  "D#": "Re#",
  Eb: "Mib",
  E: "Mi",
  F: "Fa",
  "F#": "Fa#",
  Gb: "Solb",
  G: "Sol",
  "G#": "Sol#",
  Ab: "Lab",
  A: "La",
  "A#": "La#",
  Bb: "Sib",
  B: "Si",
};

export function loadAppSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem("sheet_music_settings");
    if (!raw) return DEFAULT_SETTINGS;
    
    // Al mezclar DEFAULT_SETTINGS con el JSON, nos aseguramos de que si falta 
    // alguna propiedad nueva en el almacenamiento antiguo, no rompa la app
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("sheet_music_settings", JSON.stringify(settings));
  // Dispara el evento para que useAudioPitch y otros componentes se enteren al instante
  window.dispatchEvent(new Event("app-settings-updated"));
}

export function formatNoteBySystem(
  note: string | null | undefined,
  system: NotationSystem = "english"
): string {
  if (!note) return "—";

  // Soporta tanto "C4", "C#4" como "c/4" (formato interno de VexFlow)
  const clean = note.replace("/", "").trim();
  const match = clean.match(/^([a-gA-G][#b]?)(-?\d+)?$/);
  
  if (!match) return note;

  // Nos aseguramos de que la primera letra siempre esté en mayúscula (ej: "c#" -> "C#")
  const rawPitch = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  const octave = match[2] ?? "";

  if (system === "solfege") {
    const translated = SOLFEGE_MAP[rawPitch] || rawPitch;
    return `${translated}${octave}`;
  }

  return `${rawPitch}${octave}`;
}