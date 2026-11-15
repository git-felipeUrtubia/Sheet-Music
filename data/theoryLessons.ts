// data/theoryLessons.ts

export type AccidentalGlyph = "#" | "b" | "n" | "##" | "bb";

export interface TheoryVexNote {
    keys: string[];
    duration: string; // "w", "h", "q", "8", "wr", "hr", "qr", "8r", "hd", "hdd"
    accidental?: AccidentalGlyph;
    accidentals?: (AccidentalGlyph | null)[];
    beats?: number;
}

export interface TheoryExampleItem {
    id: string;
    name: string;
    symbolDesc: string;
    beatsText: string;
    explanation: string;
    clef: "treble" | "bass";
    timeSignature: string;
    vexNotes: TheoryVexNote[];
    audioPulses: { freq: number | number[]; beats: number }[];
    tieIndices?: [number, number];
    keySignature?: string;
    pulseCount?: number;
    clickUnit?: number;
    tuplet?: [number, number];
    grandStaff?: {
        treble: TheoryVexNote[];
        bass: TheoryVexNote[];
    };
}

export interface TheoryQuiz {
    id: string;
    prompt: string;
    options: string[];
    answerIndex: number;
    explanation: string;
}

export interface TheoryChapter {
    id: string;
    stepNumber: number;
    part: 1 | 2;
    partTitle: string;
    moduleCode: string;
    title: string;
    subtitle: string;
    intro: string;
    items: TheoryExampleItem[];
    quiz?: TheoryQuiz[];
}

export const THEORY_CHAPTERS: TheoryChapter[] = [
    {
        id: "staff-and-clefs",
        stepNumber: 1,
        part: 1,
        partTitle: "Fundamentos",
        moduleCode: "1.1",
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
        part: 1,
        partTitle: "Fundamentos",
        moduleCode: "1.2",
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
        part: 1,
        partTitle: "Fundamentos",
        moduleCode: "1.3",
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
        part: 1,
        partTitle: "Fundamentos",
        moduleCode: "1.4",
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
    {
        id: "circle-of-fifths",
        stepNumber: 5,
        part: 2,
        partTitle: "Teoría intermedia y armonía aplicada",
        moduleCode: "2.1",
        title: "El Círculo de Quintas y las Armaduras",
        subtitle: "Reconoce la tonalidad contando sostenidos y bemoles",
        intro:
            "La armadura, justo después de la clave, evita escribir la misma alteración en cada compás. Los sostenidos se acumulan en el orden Fa–Do–Sol–Re–La–Mi–Si. Los bemoles, al revés: Si–Mi–La–Re–Sol–Do–Fa. Con ese orden puedes nombrar la tonalidad de una partitura antes de leer la primera nota.",
        items: [
            {
                id: "sharp-order",
                name: "Orden de sostenidos: Fa–Do–Sol–Re–La–Mi–Si",
                symbolDesc: "El último sostenido es la sensible de la tonalidad mayor",
                beatsText: "1♯ = Sol Mayor",
                explanation:
                    "Un solo sostenido altera el Fa. La sensible de Sol Mayor es precisamente Fa♯, así que la armadura de un sostenido es Sol Mayor (y su relativo, Mi menor). Si el último sostenido fuera Do♯, la tonalidad mayor estaría un semitono más arriba: Re Mayor.",
                clef: "treble",
                timeSignature: "4/4",
                keySignature: "G",
                pulseCount: 8,
                clickUnit: 0.5,
                vexNotes: [
                    { keys: ["g/4"], duration: "8" },
                    { keys: ["a/4"], duration: "8" },
                    { keys: ["b/4"], duration: "8" },
                    { keys: ["c/5"], duration: "8" },
                    { keys: ["d/5"], duration: "8" },
                    { keys: ["e/5"], duration: "8" },
                    { keys: ["f#/5"], duration: "8" },
                    { keys: ["g/5"], duration: "8" },
                ],
                audioPulses: [
                    { freq: 392.0, beats: 0.5 },
                    { freq: 440.0, beats: 0.5 },
                    { freq: 493.88, beats: 0.5 },
                    { freq: 523.25, beats: 0.5 },
                    { freq: 587.33, beats: 0.5 },
                    { freq: 659.25, beats: 0.5 },
                    { freq: 739.99, beats: 0.5 },
                    { freq: 783.99, beats: 0.5 },
                ],
            },
            {
                id: "flat-order",
                name: "Orden de bemoles: Si–Mi–La–Re–Sol–Do–Fa",
                symbolDesc: "El penúltimo bemol nombra la tonalidad mayor",
                beatsText: "2♭ = Si bemol Mayor",
                explanation:
                    "Dos bemoles alteran Si y Mi. El penúltimo bemol (Si♭) es el nombre de la tonalidad mayor. Con un solo bemol no hay penúltimo: esa armadura es Fa Mayor, porque el único bemol es Si♭ y Fa es una quinta abajo de Do.",
                clef: "treble",
                timeSignature: "4/4",
                keySignature: "Bb",
                pulseCount: 8,
                clickUnit: 0.5,
                vexNotes: [
                    { keys: ["bb/4"], duration: "8" },
                    { keys: ["c/5"], duration: "8" },
                    { keys: ["d/5"], duration: "8" },
                    { keys: ["eb/5"], duration: "8" },
                    { keys: ["f/5"], duration: "8" },
                    { keys: ["g/5"], duration: "8" },
                    { keys: ["a/5"], duration: "8" },
                    { keys: ["bb/5"], duration: "8" },
                ],
                audioPulses: [
                    { freq: 466.16, beats: 0.5 },
                    { freq: 523.25, beats: 0.5 },
                    { freq: 587.33, beats: 0.5 },
                    { freq: 622.25, beats: 0.5 },
                    { freq: 698.46, beats: 0.5 },
                    { freq: 783.99, beats: 0.5 },
                    { freq: 880.0, beats: 0.5 },
                    { freq: 932.33, beats: 0.5 },
                ],
            },
            {
                id: "two-sharps-key",
                name: "Dos sostenidos: de la sensible a la tonalidad",
                symbolDesc: "Fa♯ y Do♯ → el último es Do♯ → Re Mayor",
                beatsText: "2♯ = Re Mayor",
                explanation:
                    "Cuenta los sostenidos en orden y quédate con el último: es la sensible. Súbele un semitono y tienes la tonalidad mayor. Do♯ sube a Re, así que dos sostenidos anuncian Re Mayor (o su relativo menor, Si menor).",
                clef: "treble",
                timeSignature: "4/4",
                keySignature: "D",
                vexNotes: [
                    { keys: ["d/4"], duration: "q" },
                    { keys: ["e/4"], duration: "q" },
                    { keys: ["f#/4"], duration: "q" },
                    { keys: ["g/4"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 293.66, beats: 1 },
                    { freq: 329.63, beats: 1 },
                    { freq: 369.99, beats: 1 },
                    { freq: 392.0, beats: 1 },
                ],
            },
        ],
        quiz: [
            {
                id: "sig-one-sharp",
                prompt: "Una armadura con un solo sostenido (Fa♯) corresponde a la tonalidad mayor de…",
                options: ["Do Mayor", "Sol Mayor", "Re Mayor", "Fa Mayor"],
                answerIndex: 1,
                explanation: "Fa♯ es la sensible de Sol. Un sostenido = Sol Mayor (relativo: Mi menor).",
            },
            {
                id: "flat-order-quiz",
                prompt: "¿Cuál es el orden en que aparecen los bemoles en la armadura?",
                options: [
                    "Fa–Do–Sol–Re–La–Mi–Si",
                    "Si–Mi–La–Re–Sol–Do–Fa",
                    "Do–Re–Mi–Fa–Sol–La–Si",
                    "Si–Do–Re–Mi–Fa–Sol–La",
                ],
                answerIndex: 1,
                explanation: "Los bemoles se leen Si–Mi–La–Re–Sol–Do–Fa, exactamente al revés que los sostenidos.",
            },
            {
                id: "two-flats",
                prompt: "Si junto a la clave hay dos bemoles (Si♭ y Mi♭), la tonalidad mayor es…",
                options: ["Mi bemol Mayor", "Si bemol Mayor", "Fa Mayor", "La bemol Mayor"],
                answerIndex: 1,
                explanation: "El penúltimo bemol nombra la tonalidad. Con Si♭ y Mi♭, el penúltimo es Si♭.",
            },
        ],
    },
    {
        id: "intervals",
        stepNumber: 6,
        part: 2,
        partTitle: "Teoría intermedia y armonía aplicada",
        moduleCode: "2.2",
        title: "Intervalos Musicales",
        subtitle: "Mide la distancia visual antes de calcular el nombre",
        intro:
            "Un intervalo cuenta las letras que hay entre dos notas, incluyendo las dos extremas. Sobre el pentagrama eso se ve como distancia: línea a espacio contiguo es una 2da; línea a la línea siguiente, una 3ra. La misma cuenta sirve en clave de sol y en clave de fa: solo cambia qué nota ocupa cada línea.",
        items: [
            {
                id: "seconds-thirds",
                name: "2das y 3ras: el paso y el salto corto",
                symbolDesc: "Línea→espacio = 2da · línea→línea = 3ra",
                beatsText: "Do–Re es 2da · Do–Mi es 3ra",
                explanation:
                    "Do–Re ocupa una línea y el espacio de al lado: segunda. Do–Mi salta al siguiente puesto del mismo tipo (línea a línea, o espacio a espacio): tercera. Las 3ras son el ladrillo de los acordes.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["d/4"], duration: "q" },
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["e/4"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 },
                    { freq: 293.66, beats: 1 },
                    { freq: 261.63, beats: 1 },
                    { freq: 329.63, beats: 1 },
                ],
            },
            {
                id: "fourths-fifths",
                name: "4tas y 5tas justas",
                symbolDesc: "Do–Fa abarca 4 letras · Do–Sol abarca 5",
                beatsText: "4ta justa y 5ta justa",
                explanation:
                    "Cuenta en voz alta: Do (1) Re (2) Mi (3) Fa (4). Do–Fa es una cuarta. Do (1) hasta Sol (5) es una quinta. En el pentagrama, la 5ta cae en la línea o el espacio de al lado del que ocuparía una 4ta: un puesto más.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["f/4"], duration: "q" },
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["g/4"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 },
                    { freq: 349.23, beats: 1 },
                    { freq: 261.63, beats: 1 },
                    { freq: 392.0, beats: 1 },
                ],
            },
            {
                id: "wide-intervals",
                name: "6tas, 7mas y 8vas",
                symbolDesc: "Do–La, Do–Si y Do–Do agudo",
                beatsText: "6ta · 7ma · 8va",
                explanation:
                    "La 6ta (Do–La) y la 7ma (Do–Si) se sienten amplias: la mano ya se abre. La 8va repite el mismo nombre doce semitonos más arriba. Si las dos notas se llaman igual y hay ocho letras en el camino, es una octava, no un unísono.",
                clef: "treble",
                timeSignature: "4/4",
                pulseCount: 6,
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["a/4"], duration: "q" },
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["b/4"], duration: "q" },
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["c/5"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 },
                    { freq: 440.0, beats: 1 },
                    { freq: 261.63, beats: 1 },
                    { freq: 493.88, beats: 1 },
                    { freq: 261.63, beats: 1 },
                    { freq: 523.25, beats: 1 },
                ],
            },
            {
                id: "bass-intervals",
                name: "La misma distancia en clave de fa",
                symbolDesc: "Fa3–Do4 es 5ta · Do3–Mi3 es 3ra",
                beatsText: "Clave de Fa",
                explanation:
                    "No memorices un mapa distinto: cuenta líneas y espacios igual que en sol. Desde el Fa de la 4ª línea, Do central (línea adicional superior) está a una 5ta. Desde Do3, Mi3 es una 3ra, el mismo dibujo que Do4–Mi4 en clave de sol.",
                clef: "bass",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["f/3"], duration: "q" },
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["c/3"], duration: "q" },
                    { keys: ["e/3"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 174.61, beats: 1 },
                    { freq: 261.63, beats: 1 },
                    { freq: 130.81, beats: 1 },
                    { freq: 164.81, beats: 1 },
                ],
            },
        ],
        quiz: [
            {
                id: "fifth-name",
                prompt: "De Do a Sol, contando las dos notas, el intervalo es una…",
                options: ["3ra", "4ta justa", "5ta justa", "6ta"],
                answerIndex: 2,
                explanation: "Do–Re–Mi–Fa–Sol suma cinco letras. Es una quinta justa.",
            },
            {
                id: "third-above-e",
                prompt: "En clave de sol, una 3ra por encima de Mi (1ª línea) llega a…",
                options: ["Fa", "Sol", "La", "Si"],
                answerIndex: 1,
                explanation: "Mi–Fa–Sol: tres letras. Mi está en línea y Sol en la línea siguiente.",
            },
            {
                id: "octave-quiz",
                prompt: "Do4 y el Do5 escrito una octava más agudo forman una…",
                options: ["Unísono", "7ma", "8va", "5ta"],
                answerIndex: 2,
                explanation: "Mismo nombre de nota y ocho letras de distancia: octava.",
            },
        ],
    },
    {
        id: "chords",
        stepNumber: 7,
        part: 2,
        partTitle: "Teoría intermedia y armonía aplicada",
        moduleCode: "2.3",
        title: "Construcción de Acordes",
        subtitle: "Tríadas, cuatríadas e inversiones",
        intro:
            "Un acorde apila terceras. La tríada tiene tres notas (fundamental, 3ra y 5ta). La cuatríada suma la 7ma. Según cómo sean esas terceras, el acorde es mayor, menor, disminuido, aumentado o una séptima. Invertir el acorde no cambia sus notas: cambia cuál de ellas queda en el bajo.",
        items: [
            {
                id: "major-minor-triads",
                name: "Tríadas mayor y menor",
                symbolDesc: "Mayor: 3ra mayor + 5ta justa · Menor: 3ra menor + 5ta justa",
                beatsText: "Do Mayor y La menor",
                explanation:
                    "Do–Mi–Sol es mayor: entre Do y Mi hay dos tonos. La–Do–Mi es menor: entre La y Do hay un tono y medio. Las dos comparten la 5ta justa. En la partitura se leen como un bloque de línea-línea-línea o espacio-espacio-espacio.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4", "e/4", "g/4"], duration: "h" },
                    { keys: ["a/4", "c/5", "e/5"], duration: "h" },
                ],
                audioPulses: [
                    { freq: [261.63, 329.63, 392.0], beats: 2 },
                    { freq: [440.0, 523.25, 659.25], beats: 2 },
                ],
            },
            {
                id: "dim-aug-triads",
                name: "Disminuido y aumentado",
                symbolDesc: "Disminuido: 3ra menor + 5ta dim. · Aumentado: 3ra mayor + 5ta aumentada",
                beatsText: "Si dism. y Do aum.",
                explanation:
                    "Si–Re–Fa aprieta la 5ta (Si–Fa es disminuida): suena inestable y pide resolver. Do–Mi–Sol♯ abre la 5ta un semitono: es la tríada aumentada. El sostenido del Sol no viene de la armadura de Do; hay que escribirlo.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["b/4", "d/5", "f/5"], duration: "h" },
                    { keys: ["c/4", "e/4", "g#/4"], duration: "h" },
                ],
                audioPulses: [
                    { freq: [493.88, 587.33, 698.46], beats: 2 },
                    { freq: [261.63, 329.63, 415.3], beats: 2 },
                ],
            },
            {
                id: "seventh-chords",
                name: "Cuatríadas: Maj7, m7 y dominante 7",
                symbolDesc: "Cuatro sonidos por terceras",
                beatsText: "DoMaj7 · Rem7 · Sol7",
                explanation:
                    "DoMaj7 (Do–Mi–Sol–Si) es mayor con 7ma mayor. Rem7 (Re–Fa–La–Do) es menor con 7ma menor. Sol7 (Sol–Si–Re–Fa) es el acorde de dominante: tríada mayor más 7ma menor. Ese Fa es el que empuja hacia Do.",
                clef: "treble",
                timeSignature: "4/4",
                pulseCount: 3,
                clickUnit: 2,
                vexNotes: [
                    { keys: ["c/4", "e/4", "g/4", "b/4"], duration: "h" },
                    { keys: ["d/4", "f/4", "a/4", "c/5"], duration: "h" },
                    { keys: ["g/4", "b/4", "d/5", "f/5"], duration: "h" },
                ],
                audioPulses: [
                    { freq: [261.63, 329.63, 392.0, 493.88], beats: 2 },
                    { freq: [293.66, 349.23, 440.0, 523.25], beats: 2 },
                    { freq: [392.0, 493.88, 587.33, 698.46], beats: 2 },
                ],
            },
            {
                id: "inversions",
                name: "Inversiones de Do Mayor",
                symbolDesc: "Fundamental, 1ª inversión y 2ª inversión",
                beatsText: "Bajo en Do, en Mi o en Sol",
                explanation:
                    "Estado fundamental: el bajo es la fundamental (Do–Mi–Sol). Primera inversión: el bajo es la 3ra (Mi–Sol–Do). Segunda inversión: el bajo es la 5ta (Sol–Do–Mi). Las notas son las mismas; cambia el bajo y, con él, el dibujo sobre el pentagrama.",
                clef: "treble",
                timeSignature: "4/4",
                pulseCount: 3,
                clickUnit: 2,
                vexNotes: [
                    { keys: ["c/4", "e/4", "g/4"], duration: "h" },
                    { keys: ["e/4", "g/4", "c/5"], duration: "h" },
                    { keys: ["g/4", "c/5", "e/5"], duration: "h" },
                ],
                audioPulses: [
                    { freq: [261.63, 329.63, 392.0], beats: 2 },
                    { freq: [329.63, 392.0, 523.25], beats: 2 },
                    { freq: [392.0, 523.25, 659.25], beats: 2 },
                ],
            },
        ],
        quiz: [
            {
                id: "c-major-quality",
                prompt: "Do–Mi–Sol es un acorde…",
                options: ["Menor", "Mayor", "Disminuido", "Aumentado"],
                answerIndex: 1,
                explanation: "3ra mayor (Do–Mi) y 5ta justa (Do–Sol): tríada mayor.",
            },
            {
                id: "first-inversion",
                prompt: "En la primera inversión de Do Mayor, la nota del bajo es…",
                options: ["Do", "Mi", "Sol", "Si"],
                answerIndex: 1,
                explanation: "La primera inversión pone la 3ra en el bajo. En Do Mayor, esa nota es Mi.",
            },
            {
                id: "dominant-seventh",
                prompt: "¿Qué notas forman el acorde de Sol dominante (Sol7)?",
                options: ["Sol–Si–Re–Fa", "Sol–Si–Re–Fa♯", "Sol–Si♭–Re–Fa", "Sol–Si–Re–La"],
                answerIndex: 0,
                explanation: "Tríada mayor de Sol más la 7ma menor, Fa natural: Sol–Si–Re–Fa.",
            },
        ],
    },
    {
        id: "advanced-rhythm",
        stepNumber: 8,
        part: 2,
        partTitle: "Teoría intermedia y armonía aplicada",
        moduleCode: "2.4",
        title: "Ritmo Avanzado y Expresión",
        subtitle: "Compases compuestos, tresillos, puntillo doble y dinámica",
        intro:
            "A partir de aquí el pulso ya no siempre es una negra. En 6/8, 9/8 y 12/8 el pulso es una negra con puntillo, y cada pulso se divide en tres corcheas. Encima de ese esqueleto aparecen síncopas, tresillos, el puntillo doble y las palabras que dicen cómo suena la frase.",
        items: [
            {
                id: "compound-six",
                name: "Compás de 6/8",
                symbolDesc: "Dos pulsos, y cada pulso vale tres corcheas",
                beatsText: "1 y a · 2 y a",
                explanation:
                    "6/8 no se cuenta como seis negras. Se balancea en dos: la negra con puntillo de cada mitad. 9/8 añade un tercer pulso (1 y a, 2 y a, 3 y a) y 12/8 un cuarto, como un 4/4 escrito en grupos de tres. El ladrillo es siempre el tresillo de corcheas que ya ves aquí.",
                clef: "treble",
                timeSignature: "6/8",
                pulseCount: 6,
                clickUnit: 0.5,
                vexNotes: [
                    { keys: ["c/4"], duration: "8" },
                    { keys: ["d/4"], duration: "8" },
                    { keys: ["e/4"], duration: "8" },
                    { keys: ["f/4"], duration: "8" },
                    { keys: ["g/4"], duration: "8" },
                    { keys: ["e/4"], duration: "8" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 0.5 },
                    { freq: 293.66, beats: 0.5 },
                    { freq: 329.63, beats: 0.5 },
                    { freq: 349.23, beats: 0.5 },
                    { freq: 392.0, beats: 0.5 },
                    { freq: 329.63, beats: 0.5 },
                ],
            },
            {
                id: "compound-nine",
                name: "9/8: tres pulsos compuestos",
                symbolDesc: "9/8 = tres negras con puntillo · 12/8 = cuatro",
                beatsText: "Tres grupos de tres",
                explanation:
                    "Este compás suma tres grupos de tres corcheas. Si añadieras un cuarto grupo idéntico tendrías 12/8, el compás de muchas baladas: se siente como un 4/4, pero cada tiempo se reparte en tres y no en dos.",
                clef: "treble",
                timeSignature: "9/8",
                pulseCount: 9,
                clickUnit: 0.5,
                vexNotes: [
                    { keys: ["c/4"], duration: "8" },
                    { keys: ["d/4"], duration: "8" },
                    { keys: ["e/4"], duration: "8" },
                    { keys: ["f/4"], duration: "8" },
                    { keys: ["g/4"], duration: "8" },
                    { keys: ["a/4"], duration: "8" },
                    { keys: ["g/4"], duration: "8" },
                    { keys: ["f/4"], duration: "8" },
                    { keys: ["e/4"], duration: "8" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 0.5 },
                    { freq: 293.66, beats: 0.5 },
                    { freq: 329.63, beats: 0.5 },
                    { freq: 349.23, beats: 0.5 },
                    { freq: 392.0, beats: 0.5 },
                    { freq: 440.0, beats: 0.5 },
                    { freq: 392.0, beats: 0.5 },
                    { freq: 349.23, beats: 0.5 },
                    { freq: 329.63, beats: 0.5 },
                ],
            },
            {
                id: "syncopation",
                name: "Síncopa",
                symbolDesc: "El acento cae fuera del pulso",
                beatsText: "Silencio de corchea y entrada a contratiempo",
                explanation:
                    "Hay síncopa cuando una nota empieza en la parte débil y se prolonga sobre el pulso siguiente, o cuando el silencio se come el tiempo fuerte. Aquí la primera corchea calla y la nota entra en el «y»: el acento se corre.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["b/4"], duration: "8r" },
                    { keys: ["c/5"], duration: "8" },
                    { keys: ["e/5"], duration: "q" },
                    { keys: ["g/4"], duration: "q" },
                    { keys: ["c/4"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 0, beats: 0.5 },
                    { freq: 523.25, beats: 0.5 },
                    { freq: 659.25, beats: 1 },
                    { freq: 392.0, beats: 1 },
                    { freq: 261.63, beats: 1 },
                ],
            },
            {
                id: "triplet",
                name: "Tresillo de corcheas",
                symbolDesc: "Tres notas en el sitio de dos",
                beatsText: "El 3 reparte una negra en tres partes iguales",
                explanation:
                    "El tresillo mete tres corcheas donde normalmente caben dos. No es el compás de 6/8: allí el tres es el pulso habitual. Aquí el compás sigue siendo de división binaria y el 3 es un invitado de un solo tiempo.",
                clef: "treble",
                timeSignature: "4/4",
                tuplet: [0, 2],
                vexNotes: [
                    { keys: ["c/4"], duration: "8", beats: 1 / 3 },
                    { keys: ["d/4"], duration: "8", beats: 1 / 3 },
                    { keys: ["e/4"], duration: "8", beats: 1 / 3 },
                    { keys: ["g/4"], duration: "q" },
                    { keys: ["c/5"], duration: "h" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 / 3 },
                    { freq: 293.66, beats: 1 / 3 },
                    { freq: 329.63, beats: 1 / 3 },
                    { freq: 392.0, beats: 1 },
                    { freq: 523.25, beats: 2 },
                ],
            },
            {
                id: "double-dot",
                name: "Puntillo doble",
                symbolDesc: "El segundo punto suma la mitad del primero",
                beatsText: "Blanca con puntillo doble = 3 tiempos y medio",
                explanation:
                    "El primer punto añade la mitad del valor (la blanca de 2 pasa a 3). El segundo punto añade la mitad de ese añadido: medio tiempo más. 2 + 1 + 0,5 = 3,5. La corchea que sigue completa el compás.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["g/4"], duration: "hdd" },
                    { keys: ["c/4"], duration: "8" },
                ],
                audioPulses: [
                    { freq: 392.0, beats: 3.5 },
                    { freq: 261.63, beats: 0.5 },
                ],
            },
            {
                id: "expression-dictionary",
                name: "Dinámica, articulación y tiempo flexible",
                symbolDesc: "pp · mp · mf · ff · crescendo · staccato · legato · calderón · rubato",
                beatsText: "Cómo suena, no solo cuánto dura",
                explanation:
                    "pp (pianissimo) es muy suave y ff (fortissimo) muy fuerte; mp y mf viven en el medio. Crescendo pide crecer el volumen hacia la siguiente nota. Staccato separa las notas, como si llevaran un punto de corte; legato las une en el mismo aire. El calderón (fermata) alarga una nota a gusto de quien toca. Tempo rubato afloja y recupera el pulso dentro de la frase sin perder el compás de conjunto.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["e/4"], duration: "q" },
                    { keys: ["g/4"], duration: "q" },
                    { keys: ["c/5"], duration: "q" },
                ],
                audioPulses: [
                    { freq: 261.63, beats: 1 },
                    { freq: 329.63, beats: 1 },
                    { freq: 392.0, beats: 1 },
                    { freq: 523.25, beats: 1 },
                ],
            },
        ],
        quiz: [
            {
                id: "six-eight-feel",
                prompt: "En un compás de 6/8 el pulso se siente como…",
                options: [
                    "Seis negras iguales",
                    "Dos negras con puntillo",
                    "Una redonda",
                    "Cuatro corcheas",
                ],
                answerIndex: 1,
                explanation: "6/8 se balancea en dos pulsos. Cada pulso es una negra con puntillo (tres corcheas).",
            },
            {
                id: "triplet-span",
                prompt: "Un tresillo de corcheas ocupa el mismo tiempo que…",
                options: ["Tres negras", "Una blanca", "Dos corcheas (una negra)", "Un compás de 6/8"],
                answerIndex: 2,
                explanation: "El 3 indica tres notas en el lugar de dos de la misma figura. Tres corcheas en tresillo = una negra.",
            },
            {
                id: "pp-fermata",
                prompt: "¿Qué indica el calderón (fermata) sobre una nota?",
                options: [
                    "Tocarla muy corto, en staccato",
                    "Prolongarla más de su valor, a gusto del intérprete",
                    "Subirla un semitono",
                    "Repetir el compás desde el principio",
                ],
                answerIndex: 1,
                explanation: "El calderón detiene el pulso escrito y alarga ese sonido hasta que la frase lo pide.",
            },
        ],
    },
    {
        id: "two-hands",
        stepNumber: 9,
        part: 2,
        partTitle: "Teoría intermedia y armonía aplicada",
        moduleCode: "2.5",
        title: "Lectura a Dos Manos",
        subtitle: "Clave de sol y clave de fa en el mismo sistema",
        intro:
            "El piano escribe las dos manos a la vez: la llave de sol arriba y la de fa abajo, unidas por una llave. Tres anclas alcanzan para no perderse: Do central (C4) entre los dos pentagramas, Sol4 en la 2ª línea de sol y Fa3 en la 4ª línea de fa. La mano izquierda suele leer bloques; la derecha, la línea que canta.",
        items: [
            {
                id: "grand-landmarks",
                name: "Las tres anclas del sistema",
                symbolDesc: "Do central · Sol4 · Fa3",
                beatsText: "El mismo Do4, visto desde cada clave",
                explanation:
                    "Do central se escribe con una línea adicional bajo la clave de sol y con una línea adicional sobre la clave de fa: es la misma tecla. Sol4 es la línea donde nace la espiral. Fa3 es la línea que abrazan los dos puntos de la clave de fa. Localiza esas tres antes de leer el compás.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "h" },
                    { keys: ["g/4"], duration: "h" },
                ],
                grandStaff: {
                    treble: [
                        { keys: ["c/4"], duration: "h" },
                        { keys: ["g/4"], duration: "h" },
                    ],
                    bass: [
                        { keys: ["f/3"], duration: "h" },
                        { keys: ["c/4"], duration: "h" },
                    ],
                },
                audioPulses: [
                    { freq: [261.63, 174.61], beats: 2 },
                    { freq: [392.0, 261.63], beats: 2 },
                ],
            },
            {
                id: "melody-over-chord",
                name: "Melodía en la derecha, acorde en la izquierda",
                symbolDesc: "La izquierda sostiene · la derecha conduce",
                beatsText: "Do Mayor y luego Fa Mayor, en blancas",
                explanation:
                    "No leas las dos manos nota por nota y de abajo hacia arriba. Primero reconoce el bloque de la izquierda (aquí Do–Mi–Sol, después Do–Fa–La) y después sigue la melodía de la derecha, que se mueve en negras. El acorde cambia cada blanca; la melodía, cada negra.",
                clef: "treble",
                timeSignature: "4/4",
                vexNotes: [
                    { keys: ["c/4"], duration: "q" },
                    { keys: ["d/4"], duration: "q" },
                    { keys: ["e/4"], duration: "q" },
                    { keys: ["g/4"], duration: "q" },
                ],
                grandStaff: {
                    treble: [
                        { keys: ["c/4"], duration: "q" },
                        { keys: ["d/4"], duration: "q" },
                        { keys: ["e/4"], duration: "q" },
                        { keys: ["g/4"], duration: "q" },
                    ],
                    bass: [
                        { keys: ["c/3", "e/3", "g/3"], duration: "h" },
                        { keys: ["c/3", "f/3", "a/3"], duration: "h" },
                    ],
                },
                audioPulses: [
                    { freq: [261.63, 130.81, 164.81, 196.0], beats: 1 },
                    { freq: 293.66, beats: 1 },
                    { freq: [329.63, 130.81, 174.61, 220.0], beats: 1 },
                    { freq: 392.0, beats: 1 },
                ],
            },
        ],
        quiz: [
            {
                id: "middle-c-treble",
                prompt: "En clave de sol, el Do central (C4) se escribe…",
                options: [
                    "En la 2ª línea",
                    "En una línea adicional por debajo del pentagrama",
                    "En el espacio superior, por encima de la 5ª línea",
                    "En la 4ª línea",
                ],
                answerIndex: 1,
                explanation: "Do central cuelga de una línea adicional bajo la clave de sol. En fa, esa misma nota va sobre el pentagrama.",
            },
            {
                id: "bass-f-line",
                prompt: "En clave de fa, la nota de la 4ª línea (entre los dos puntos) es…",
                options: ["Do3", "Fa3", "Sol3", "Do4"],
                answerIndex: 1,
                explanation: "Los dos puntos rodean la 4ª línea y esa línea es Fa3.",
            },
            {
                id: "two-hand-strategy",
                prompt: "Al leer las dos manos a la vez, el orden que más ayuda es…",
                options: [
                    "Descifrar cada corchea de la izquierda antes de mirar la derecha",
                    "Leer el acorde de la izquierda como un bloque y seguir la melodía con la derecha",
                    "Ignorar la clave de fa hasta el segundo sistema",
                    "Contar las líneas de arriba hacia abajo",
                ],
                answerIndex: 1,
                explanation: "La izquierda suele moverse por bloques más lentos. Reconocer el acorde libera la vista para la melodía.",
            },
        ],
    },
];