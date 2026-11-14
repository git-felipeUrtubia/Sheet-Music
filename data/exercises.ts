// data/exercises.ts
import { Exercise, DifficultyLevel, ClefType, NoteItem } from "@/types/exercise";

// Diccionario de notas con su equivalente MIDI exacto
const PITCH_TO_MIDI: Record<string, number> = {
    // Clave de Fa (Octavas 2 y 3)
    "g/2": 43, "a/2": 45, "b/2": 47,
    "c/3": 48, "c#/3": 49, "d/3": 50, "e/3": 52, "f/3": 53, "f#/3": 54, "g/3": 55, "a/3": 57, "b/3": 59,
    // Clave de Sol (Octavas 4 y 5)
    "c/4": 60, "c#/4": 61, "d/4": 62, "d#/4": 63, "e/4": 64, "f/4": 65, "f#/4": 66, "g/4": 67, "g#/4": 68, "a/4": 69, "b/4": 71,
    "c/5": 72, "d/5": 74, "e/5": 76, "f/5": 77, "g/5": 79,
};

// Escalas por nivel y clave
const POOLS = {
    principiante: {
        treble: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4"],
        bass: ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3"],
    },
    intermedio: {
        treble: ["c/4", "d/4", "e/4", "f/4", "f#/4", "g/4", "a/4", "b/4", "c/5"],
        bass: ["g/2", "a/2", "b/2", "c/3", "d/3", "e/3", "f#/3", "g/3", "a/3"],
    },
    avanzado: {
        treble: ["c/4", "c#/4", "d/4", "e/4", "f/4", "f#/4", "g/4", "g#/4", "a/4", "b/4", "c/5", "d/5", "e/5"],
        bass: ["g/2", "a/2", "b/2", "c/3", "c#/3", "d/3", "e/3", "f/3", "f#/3", "g/3", "a/3", "b/3", "c/4"],
    },
};

// Patrones rítmicos de 1 compás (4 tiempos en total)
const RHYTHM_PATTERNS: Record<DifficultyLevel, string[][]> = {
    // Principiante: Blancas y Negras (2 compases = 8 tiempos por ejercicio)
    principiante: [
        ["h", "h"],
        ["q", "q", "h"],
        ["h", "q", "q"],
        ["q", "q", "q", "q"],
    ],
    // Intermedio: Negras y pares de Corcheas (2 a 3 compases)
    intermedio: [
        ["q", "8", "8", "q", "q"],
        ["q", "q", "8", "8", "q"],
        ["8", "8", "q", "8", "8", "q"],
        ["h", "8", "8", "q"],
    ],
    // Avanzado: Corcheas continuas, síncopas y saltos (3 compases = 12 tiempos)
    avanzado: [
        ["8", "8", "8", "8", "q", "q"],
        ["q", "8", "8", "8", "8", "q"],
        ["8", "8", "q", "8", "8", "8", "8"],
        ["8", "8", "8", "8", "8", "8", "q"],
    ],
};

// Generador pseudoaleatorio determinista (siempre genera exactamente los mismos 90 ejercicios)
function seededRandom(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

function buildExercisesForLevel(level: DifficultyLevel, count: number): Exercise[] {
    const list: Exercise[] = [];
    const patterns = RHYTHM_PATTERNS[level];
    const measuresPerExercise = level === "principiante" ? 2 : level === "intermedio" ? 2 : 3;

    for (let i = 1; i <= count; i++) {
        // Alternamos Clave de Sol y Clave de Fa para entrenar ambas manos
        const clef: ClefType = i % 3 === 0 ? "bass" : "treble";
        const scale = POOLS[level][clef];
        const notes: NoteItem[] = [];

        let currentIdx = Math.floor(seededRandom(i * 17) * scale.length);
        const maxStep = level === "principiante" ? 1 : level === "intermedio" ? 2 : 3;

        for (let m = 0; m < measuresPerExercise; m++) {
            const pattern = patterns[(i + m) % patterns.length];
            pattern.forEach((duration, nIdx) => {
                const rand = seededRandom(i * 100 + m * 20 + nIdx * 7);
                const delta = Math.floor(rand * (maxStep * 2 + 1)) - maxStep;
                currentIdx = Math.max(0, Math.min(scale.length - 1, currentIdx + delta));

                const pitch = scale[currentIdx];
                notes.push({
                    pitch,
                    duration,
                    midiNote: PITCH_TO_MIDI[pitch],
                });
            });
        }

        const clefLabel = clef === "treble" ? "Clave de Sol" : "Clave de Fa";
        list.push({
            id: `${level}-${i}`,
            title: `Estudio #${i} (${clefLabel})`,
            level,
            clef,
            timeSignature: "4/4",
            notes,
        });
    }

    return list;
}

export const EXERCISES_DATA: Exercise[] = [
    ...buildExercisesForLevel("principiante", 30),
    ...buildExercisesForLevel("intermedio", 30),
    ...buildExercisesForLevel("avanzado", 30),
];