// data/theoryLessons.ts

export interface TheoryExampleItem {
    id: string;
    name: string;
    symbolDesc: string;
    beatsText: string;
    explanation: string;
    // Configuración para renderizar en VexFlow y hacer sonar la demostración
    clef: "treble" | "bass";
    timeSignature: string;
    vexNotes: {
        keys: string[];
        duration: string; // "w", "h", "q", "8", "wr", "hr", "qr", "8r", "hd"
        accidental?: "#" | "b" | "n";
    }[];
    // Notas a disparar en el audio de ejemplo (frecuencia en Hz y duración en pulsos; 0 Hz = silencio)
    audioPulses: { freq: number; beats: number }[];
    tieIndices?: [number, number]; // Si el ejemplo lleva ligadura entre dos notas
}

export interface TheoryChapter {
    id: string;
    stepNumber: number;
    title: string;
    subtitle: string;
    intro: string;
    items: TheoryExampleItem[];
}

export const THEORY_CHAPTERS: TheoryChapter[] = [
    {
        id: "staff-and-clefs",
        stepNumber: 1,
        title: "El Pentagrama y las Claves",
        subtitle: "El mapa donde se ubican las alturas de los sonidos",
        intro:
            "El pentagrama tiene 5 líneas y 4 espacios (se cuentan de abajo hacia arriba). La Clave al inicio nos indica qué nota corresponde a cada línea: la Clave de Sol se usa para registros agudos (mano derecha en piano, flauta, violín) y la Clave de Fa para registros graves (mano izquierda en piano).",
        items: [
            {
                id: "treble-landmarks",
                name: "Clave de Sol y Notas Guía (Do4 - Sol4)",
                symbolDesc: "La espiral nace en la 2ª línea (Sol4)",
                beatsText: "Registro Medio / Agudo",
                explanation:
                    "El Do Central (C4) se escribe con una pequeña línea adicional debajo del pentagrama. La 2ª línea donde nace la espiral de la clave es siempre la nota Sol (G4).",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "h" },
                    { keys: ["g/4"], duration: "h" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 2 }, // C4
                    { freq: 392.0, beats: 2 },  // G4
                ],
            },
            {
                id: "bass-landmarks",
                name: "Clave de Fa y Notas Guía (Fa3 - Do4)",
                symbolDesc: "Los dos puntos rodean la 4ª línea (Fa3)",
                beatsText: "Registro Grave",
                explanation:
                    "En Clave de Fa, la 4ª línea (entre los dos puntitos) es siempre la nota Fa (F3). Si subes hasta la línea adicional por encima del pentagrama, llegas al mismo Do Central (C4).",
                clef: "bass",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/3"], duration: "q" },
                    { keys: ["f/3"], duration: "q" },
                    { keys: ["c/4"], duration: "h" },
                ],
                audioPulses: [
                    { freq: 130.81, beats: 1 }, // C3
                    { freq: 174.61, beats: 1 }, // F3
                    { freq: 261.63, beats: 2 }, // C4
                ],
            },
        ],
    },
    {
        id: "note-durations",
        stepNumber: 2,
        title: "Los Tiempos y Figuras Musicales",
        subtitle: "¿Cuánto tiempo debemos mantener presionada cada nota?",
        intro:
            "La música se divide en pulsos constantes (como el tic-tac de un reloj o el metrónomo). En un compás estándar de 4/4 caben 4 pulsos de Negra por compás. La forma de la nota nos dice cuántos pulsos dura:",
        items: [
            {
                id: "whole-note",
                name: "Redonda (Whole Note)",
                symbolDesc: "Óvalo blanco sin plica (palito)",
                beatsText: "4 Tiempos completos",
                explanation:
                    "Es la figura más larga habitual: tocas la nota en el tiempo 1 y la mantienes sonando durante los 4 clics del compás (1 - 2 - 3 - 4).",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [{ keys: ["g/4"], duration: "w" }],
                audioPulses: [{ freq: 392.0, beats: 4 }],
            },
            {
                id: "half-note",
                name: "Blanca (Half Note)",
                symbolDesc: "Óvalo blanco con plica",
                beatsText: "2 Tiempos cada una",
                explanation:
                    "Dura la mitad de una redonda (2 pulsos). En un compás de 4/4 caben exactamente dos blancas (tiempos 1-2 y tiempos 3-4).",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["e/4"], duration: "h" },
                    { keys: ["g/4"], duration: "h" },
                ],
                audioPulses: [
                    { freq: 329.63, beats: 2 },
                    { freq: 392.0, beats: 2 },
                ],
            },
            {
                id: "quarter-note",
                name: "Negra (Quarter Note)",
                symbolDesc: "Óvalo negro relleno con plica",
                beatsText: "1 Tiempo cada una",
                explanation:
                    "Es la unidad base del pulso: cada negra coincide exactamente con 1 clic del metrónomo. Cuatro negras llenan un compás de 4/4.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["d/4"], duration: "q" },
                    { keys: ["e/4"], duration: "q" },
                    { keys: ["f/4"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 },
                    { freq: 293.66, beats: 1 },
                    { freq: 329.63, beats: 1 },
                    { freq: 349.23, beats: 1 },
                ],
            },
            {
                id: "eighth-note",
                name: "Corcheas (Eighth Notes)",
                symbolDesc: "Óvalo negro con corchete o barra superior",
                beatsText: "1/2 Tiempo (2 por cada clic)",
                explanation:
                    "Valen medio pulso. Se tocan dos corcheas dentro de un solo clic del metrónomo (una cae con el clic y la otra en la mitad: '1-y, 2-y').",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["g/4"], duration: "8" },
                    { keys: ["a/4"], duration: "8" },
                    { keys: ["g/4"], duration: "8" },
                    { keys: ["e/4"], duration: "8" },
                    { keys: ["c/4"], duration: "h" },
                ],
                audioPulses: [
                    { freq: 392.0, beats: 0.5 },
                    { freq: 440.0, beats: 0.5 },
                    { freq: 392.0, beats: 0.5 },
                    { freq: 329.63, beats: 0.5 },
                    { freq: 261.63, beats: 2 },
                ],
            },
        ],
    },
    {
        id: "musical-rests",
        stepNumber: 3,
        title: "Las Pausas (Silencios)",
        subtitle: "Cuando el silencio también forma parte del ritmo",
        intro:
            "En una partitura no todo el tiempo suena el instrumento. Los silencios ordenan dejar de tocar durante una cantidad exacta de pulsos mientras el reloj del compás sigue avanzando:",
        items: [
            {
                id: "whole-and-half-rest",
                name: "Silencio de Blanca (2 tiempos) vs. Redonda (4 tiempos)",
                symbolDesc: "Sombrero sobre la 3ª línea (2t) / Colgando de la 4ª línea (4t)",
                beatsText: "2 Tiempos de pausa",
                explanation:
                    "El rectángulo apoyado sobre la 3ª línea (como un sombrero puesto) indica 2 tiempos de silencio. Si cuelga debajo de la 4ª línea, dura 4 tiempos (o todo el compás).",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["g/4"], duration: "h" },
                    { keys: ["b/4"], duration: "hr" }, // Silencio de blanca
                ],
                audioPulses: [
                    { freq: 392.0, beats: 2 },
                    { freq: 0, beats: 2 }, // 2 pulsos de silencio
                ],
            },
            {
                id: "quarter-and-eighth-rest",
                name: "Silencio de Negra (1 tiempo) y de Corchea (1/2 tiempo)",
                symbolDesc: "Zigzag vertical (1t) y bastón con gancho (1/2t)",
                beatsText: "1 Tiempo y 1/2 Tiempo de pausa",
                explanation:
                    "El rayo/zigzag en el centro del pentagrama equivale a 1 pulso completo en silencio. Escucha cómo suena tocar en el pulso 1, callar en el 2 y volver en el 3:",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["b/4"], duration: "qr" }, // Silencio de negra
                    { keys: ["e/4"], duration: "q" },
                    { keys: ["g/4"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 },
                    { freq: 0, beats: 1 },
                    { freq: 329.63, beats: 1 },
                    { freq: 392.0, beats: 1 },
                ],
            },
        ],
    },
    {
        id: "intermediate-symbols",
        stepNumber: 4,
        title: "Símbolos de Nivel Básico - Intermedio",
        subtitle: "Puntillos, ligaduras y alteraciones que verás en las canciones",
        intro:
            "Para leer partituras reales (como temas de anime o música clásica en compás de 3/4 o 4/4) encontrarás estos tres modificadores esenciales:",
        items: [
            {
                id: "dotted-note",
                name: "El Puntillo (ej. Blanca con Puntillo = 3 tiempos)",
                symbolDesc: "Un punto pequeño a la derecha de la nota",
                beatsText: "Suma +50% de duración a la nota",
                explanation:
                    "El puntillo le añade a una figura la mitad de su valor original. Como la Blanca vale 2 tiempos, una Blanca con puntillo dura 2 + 1 = 3 tiempos completos (muy común en valses de 3/4).",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["f/4"], duration: "hd" }, // Blanca con puntillo (3 tiempos)
                    { keys: ["g/4"], duration: "q" },  // Negra (1 tiempo)
                ],
                audioPulses: [
                    { freq: 349.23, beats: 3 },
                    { freq: 392.0, beats: 1 },
                ],
            },
            {
                id: "tied-notes",
                name: "Ligadura de Prolongación (Tie)",
                symbolDesc: "Arco curvo que une dos notas del mismo nombre",
                beatsText: "Une y suma ambas duraciones sin volver a golpear",
                explanation:
                    "Cuando un arco une dos notas iguales, NO debes volver a tocar la segunda nota: simplemente mantienes presionada la primera sumando el tiempo de ambas.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["a/4"], duration: "h" },
                    { keys: ["a/4"], duration: "q" },
                    { keys: ["e/4"], duration: "q" },
                ],
                tieIndices: [0, 1],
                audioPulses: [
                    { freq: 440.0, beats: 3 }, // Blanca (2) + Negra ligada (1) = 3 tiempos continuos
                    { freq: 329.63, beats: 1 },
                ],
            },
            {
                id: "accidentals",
                name: "Alteraciones: Sostenido (#) y Bemol (b)",
                symbolDesc: "# sube medio tono (tecla negra der.) | b baja medio tono",
                beatsText: "Modifican la altura por 1 compás",
                explanation:
                    "El Sostenido (#) sube la nota medio tono (hacia la tecla negra inmediata a la derecha en el piano) y el Bemol (b) la baja medio tono. Si están al inicio junto a la clave (Armadura), afectan a toda la obra.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["f/4"], duration: "q" },
                    { keys: ["f/4"], duration: "q", accidental: "#" },
                    { keys: ["g/4"], duration: "h" },
                ],
                audioPulses: [
                    { freq: 349.23, beats: 1 }, // Fa4 natural
                    { freq: 369.99, beats: 1 }, // Fa#4 sostenido
                    { freq: 392.0, beats: 2 },  // Sol4
                ],
            },
        ],
    },
];