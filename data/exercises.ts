// data/exercises.ts
import { Exercise } from "@/types/exercise";

export const EXERCISES_DATA: Exercise[] = [
    // ==========================================
    // NIVEL: PRINCIPIANTE
    // ==========================================

    {
        id: "ex-beg-4",
        title: "Introducción a las Corcheas (Paso a Paso)",
        level: "principiante",
        clef: "treble",
        timeSignature: "4/4",
        notes: [
            { pitch: "c/4", duration: "q", midiNote: 60 }, // Tiempo 1: Negra (Do4)
            { pitch: "d/4", duration: "q", midiNote: 62 }, // Tiempo 2: Negra (Re4)
            { pitch: "e/4", duration: "8", midiNote: 64 }, // Tiempo 3 (y): Corchea (Mi4)
            { pitch: "f/4", duration: "8", midiNote: 65 }, // Tiempo 3 (&): Corchea (Fa4)
            { pitch: "g/4", duration: "8", midiNote: 67 }, // Tiempo 4 (y): Corchea (Sol4)
            { pitch: "f/4", duration: "8", midiNote: 65 }, // Tiempo 4 (&): Corchea (Fa4)
        ],
    },
    {
        id: "ex-beg-1",
        title: "Escala Ascendente Básica (Do - Fa)",
        level: "principiante",
        clef: "treble",
        timeSignature: "4/4",
        notes: [
            { pitch: "c/4", duration: "q", midiNote: 60 }, // Do4
            { pitch: "d/4", duration: "q", midiNote: 62 }, // Re4
            { pitch: "e/4", duration: "q", midiNote: 64 }, // Mi4
            { pitch: "f/4", duration: "q", midiNote: 65 }, // Fa4
        ],
    },
    {
        id: "ex-beg-2",
        title: "Descenso desde Sol (Sol - Re)",
        level: "principiante",
        clef: "treble",
        timeSignature: "4/4",
        notes: [
            { pitch: "g/4", duration: "q", midiNote: 67 }, // Sol4
            { pitch: "f/4", duration: "q", midiNote: 65 }, // Fa4
            { pitch: "e/4", duration: "q", midiNote: 64 }, // Mi4
            { pitch: "d/4", duration: "q", midiNote: 62 }, // Re4
        ],
    },
    {
        id: "ex-beg-3",
        title: "Puntos de Anclaje en Clave de Fa",
        level: "principiante",
        clef: "bass",
        timeSignature: "4/4",
        notes: [
            { pitch: "f/3", duration: "q", midiNote: 53 }, // Fa3 (Línea de clave de Fa)
            { pitch: "e/3", duration: "q", midiNote: 52 }, // Mi3
            { pitch: "d/3", duration: "q", midiNote: 50 }, // Re3
            { pitch: "c/3", duration: "q", midiNote: 48 }, // Do3
        ],
    },


    // ==========================================
    // NIVEL: INTERMEDIO
    // ==========================================
    {
        id: "ex-int-1",
        title: "Saltos de Tercera y Mano Izquierda",
        level: "intermedio",
        clef: "bass",
        timeSignature: "4/4",
        notes: [
            { pitch: "c/3", duration: "q", midiNote: 48 }, // Do3
            { pitch: "e/3", duration: "q", midiNote: 52 }, // Mi3
            { pitch: "d/3", duration: "q", midiNote: 50 }, // Re3
            { pitch: "f/3", duration: "q", midiNote: 53 }, // Fa3
        ],
    },
    {
        id: "ex-int-2",
        title: "Tríada de Sol Mayor y Sexta",
        level: "intermedio",
        clef: "treble",
        timeSignature: "4/4",
        notes: [
            { pitch: "g/4", duration: "q", midiNote: 67 }, // Sol4
            { pitch: "b/4", duration: "q", midiNote: 71 }, // Si4
            { pitch: "d/5", duration: "q", midiNote: 74 }, // Re5
            { pitch: "e/5", duration: "q", midiNote: 76 }, // Mi5
        ],
    },
    {
        id: "ex-int-3",
        title: "Bajos Profundos en Quintas (Do2 - Do3)",
        level: "intermedio",
        clef: "bass",
        timeSignature: "4/4",
        notes: [
            { pitch: "c/2", duration: "q", midiNote: 36 }, // Do2
            { pitch: "g/2", duration: "q", midiNote: 43 }, // Sol2
            { pitch: "a/2", duration: "q", midiNote: 45 }, // La2
            { pitch: "c/3", duration: "q", midiNote: 48 }, // Do3
        ],
    },

    // ==========================================
    // NIVEL: AVANZADO
    // ==========================================
    {
        id: "ex-adv-1",
        title: "Arpegio Extendido con Octava",
        level: "avanzado",
        clef: "treble",
        timeSignature: "4/4",
        notes: [
            { pitch: "c/4", duration: "q", midiNote: 60 }, // Do4
            { pitch: "e/4", duration: "q", midiNote: 64 }, // Mi4
            { pitch: "g/4", duration: "q", midiNote: 67 }, // Sol4
            { pitch: "c/5", duration: "q", midiNote: 72 }, // Do5
        ],
    },
    {
        id: "ex-adv-2",
        title: "Arpegio Menor en Registro Agudo",
        level: "avanzado",
        clef: "treble",
        timeSignature: "4/4",
        notes: [
            { pitch: "a/4", duration: "q", midiNote: 69 }, // La4
            { pitch: "c/5", duration: "q", midiNote: 72 }, // Do5
            { pitch: "e/5", duration: "q", midiNote: 76 }, // Mi5
            { pitch: "a/5", duration: "q", midiNote: 81 }, // La5 (Línea adicional superior)
        ],
    },
    {
        id: "ex-adv-3",
        title: "Saltos Amplios de Mano Izquierda",
        level: "avanzado",
        clef: "bass",
        timeSignature: "4/4",
        notes: [
            { pitch: "f/2", duration: "q", midiNote: 41 }, // Fa2
            { pitch: "c/3", duration: "q", midiNote: 48 }, // Do3
            { pitch: "f/3", duration: "q", midiNote: 53 }, // Fa3
            { pitch: "a/3", duration: "q", midiNote: 57 }, // La3
        ],
    },
];