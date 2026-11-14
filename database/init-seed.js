/* eslint-disable @typescript-eslint/no-require-imports */
// database/init-seed.js
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbDir = __dirname;
const dbPath = path.join(dbDir, "seed.db");
const publicDir = path.join(dbDir, "..", "public");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const db = new Database(dbPath);

// 1. Crear tablas de Ejercicios, Catálogo de Partituras y Progreso
db.exec(`
  CREATE TABLE exercises (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    level TEXT NOT NULL,
    clef TEXT NOT NULL,
    time_signature TEXT NOT NULL,
    notes_json TEXT NOT NULL
  );

  CREATE INDEX idx_exercises_level ON exercises(level);

  CREATE TABLE scores (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    composer TEXT NOT NULL,
    level TEXT NOT NULL,
    genre TEXT NOT NULL,
    instrument TEXT NOT NULL,
    clef TEXT NOT NULL,
    time_signature TEXT NOT NULL,
    bpm INTEGER NOT NULL,
    measures_count INTEGER NOT NULL,
    score_file TEXT NOT NULL,
    musicxml_content TEXT NOT NULL
  );

  CREATE INDEX idx_scores_filters ON scores(level, instrument, genre);

  CREATE TABLE user_progress (
    exercise_id TEXT PRIMARY KEY,
    completed INTEGER DEFAULT 0,
    best_bpm INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// 2. Configuración de los 90 ejercicios
const PITCH_TO_MIDI = {
  "g/2": 43, "a/2": 45, "b/2": 47,
  "c/3": 48, "c#/3": 49, "d/3": 50, "e/3": 52, "f/3": 53, "f#/3": 54, "g/3": 55, "a/3": 57, "b/3": 59,
  "c/4": 60, "c#/4": 61, "d/4": 62, "d#/4": 63, "e/4": 64, "f/4": 65, "f#/4": 66, "g/4": 67, "g#/4": 68, "a/4": 69, "b/4": 71,
  "c/5": 72, "d/5": 74, "e/5": 76, "f/5": 77, "g/5": 79,
};

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

const RHYTHM_PATTERNS = {
  principiante: [["h", "h"], ["q", "q", "h"], ["h", "q", "q"], ["q", "q", "q", "q"]],
  intermedio: [["q", "8", "8", "q", "q"], ["q", "q", "8", "8", "q"], ["8", "8", "q", "8", "8", "q"], ["h", "8", "8", "q"]],
  avanzado: [["8", "8", "8", "8", "q", "q"], ["q", "8", "8", "8", "8", "q"], ["8", "8", "q", "8", "8", "8", "8"], ["8", "8", "8", "8", "8", "8", "q"]],
};

function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// 3. Catálogo inicial de Partituras
const INITIAL_SCORES = [
  {
    id: "genshin-impact-main-theme",
    title: "Genshin Impact Main Theme OST",
    composer: "Yu-Peng Chen",
    level: "principiante",
    genre: "videojuegos",
    instrument: "piano",
    clef: "grand",
    timeSignature: "3/4",
    bpm: 80,
    measuresCount: 52,
    scoreFile: "/scores/Genshin Impact Main Theme.musicxml",
  },
  {
    id: "je-te-laisserai-des-mots",
    title: "Je Te Laisserai Des Mots",
    composer: "Patrick Watson",
    level: "principiante",
    genre: "clasica",
    instrument: "piano",
    clef: "grand",
    timeSignature: "3/4",
    bpm: 108,
    measuresCount: 92,
    scoreFile: "/scores/Je Te Laisserai Des Mots - Patrick Watson.musicxml",
  },
  {
    id: "if-i-am-with-you-jjk",
    title: "If I Am With You (Jujutsu Kaisen)",
    composer: "Yoshimasa Terui (Arr. Welder Dias)",
    level: "principiante",
    genre: "anime",
    instrument: "piano",
    clef: "grand",
    timeSignature: "3/4",
    bpm: 140,
    measuresCount: 48,
    scoreFile: "/scores/Jujutsu Kaisen -If i am with you- - Yoshimasa Terui.musicxml",
  },
  {
    id: "kamado-tanjiro-no-uta",
    title: "Kamado Tanjiro no Uta (Kimetsu no Yaiba)",
    composer: "Go Shiina",
    level: "principiante",
    genre: "anime",
    instrument: "piano",
    clef: "grand",
    timeSignature: "4/4",
    bpm: 150,
    measuresCount: 59,
    scoreFile: "/scores/Kamado Tanjiro no Uta - Demon Slayer Kimetsu no yaiba EASSY.musicxml",
  },
  {
    id: "nezukos-theme-easy",
    title: "Nezuko's Theme EASY (Demon Slayer)",
    composer: "Yuki Kajiura & Go Shiina (Arr. Maytas Dhamalongkrot)",
    level: "principiante",
    genre: "anime",
    instrument: "piano",
    clef: "grand",
    timeSignature: "4/4",
    bpm: 140,
    measuresCount: 114,
    scoreFile: "/scores/Nezuko-s Theme - Demon Slayer.musicxml",
  },
  {
    id: "minecraft-sweden",
    title: "Minecraft: Sweden",
    composer: "Daniel Rosenfeld (C418)",
    level: "principiante",
    genre: "videojuegos",
    instrument: "piano",
    clef: "grand",
    timeSignature: "4/4",
    bpm: 50,
    measuresCount: 10,
    scoreFile: "/scores/Sweden from Minecraft - C418.musicxml",
  },
  {
    id: "game-of-thrones-violin",
    title: "Game of Thrones (Main Theme)",
    composer: "Ramin Djawadi",
    level: "intermedio",
    genre: "clasica",
    instrument: "violin",
    clef: "treble",
    timeSignature: "3/4",
    bpm: 172,
    measuresCount: 88,
    scoreFile: "/scores/Game of Thrones.musicxml",
  },
  {
    id: "por-una-cabeza-violin",
    title: "Por una Cabeza",
    composer: "Carlos Gardel (Arr. Mateus Tonette)",
    level: "avanzado",
    genre: "folclore",
    instrument: "violin",
    clef: "treble",
    timeSignature: "2/4",
    bpm: 60,
    measuresCount: 34,
    scoreFile: "/scores/Por una Cabeza.musicxml",
  },
  {
    id: "frieren-time-flows-ever-onward-flute",
    title: "Time Flows Ever Onward (Frieren)",
    composer: "Evan Call (Arr. Jch)",
    level: "intermedio",
    genre: "anime",
    instrument: "flute",
    clef: "treble",
    timeSignature: "3/4",
    bpm: 112,
    measuresCount: 50,
    scoreFile: "/scores/Frieren Flows Ever Onwerd.musicxml",
  },
];

const insertExercise = db.prepare(`
  INSERT INTO exercises (id, title, level, clef, time_signature, notes_json)
  VALUES (@id, @title, @level, @clef, @timeSignature, @notesJson)
`);

const insertScore = db.prepare(`
  INSERT INTO scores (
    id, title, composer, level, genre, instrument, clef,
    time_signature, bpm, measures_count, score_file, musicxml_content
  ) VALUES (
    @id, @title, @composer, @level, @genre, @instrument, @clef,
    @timeSignature, @bpm, @measuresCount, @scoreFile, @musicxmlContent
  )
`);

const seedTransaction = db.transaction(() => {
  // Insertar los 90 ejercicios
  ["principiante", "intermedio", "avanzado"].forEach((level) => {
    const patterns = RHYTHM_PATTERNS[level];
    const measures = level === "avanzado" ? 3 : 2;
    const maxStep = level === "principiante" ? 1 : level === "intermedio" ? 2 : 3;

    for (let i = 1; i <= 30; i++) {
      const clef = i % 3 === 0 ? "bass" : "treble";
      const scale = POOLS[level][clef];
      const notes = [];
      let currentIdx = Math.floor(seededRandom(i * 17) * scale.length);

      for (let m = 0; m < measures; m++) {
        const pattern = patterns[(i + m) % patterns.length];
        pattern.forEach((duration, nIdx) => {
          const rand = seededRandom(i * 100 + m * 20 + nIdx * 7);
          const delta = Math.floor(rand * (maxStep * 2 + 1)) - maxStep;
          currentIdx = Math.max(0, Math.min(scale.length - 1, currentIdx + delta));
          const pitch = scale[currentIdx];
          notes.push({ pitch, duration, midiNote: PITCH_TO_MIDI[pitch] });
        });
      }

      const clefLabel = clef === "treble" ? "Clave de Sol" : "Clave de Fa";
      insertExercise.run({
        id: `${level}-${i}`,
        title: `Estudio #${i} (${clefLabel})`,
        level,
        clef,
        timeSignature: "4/4",
        notesJson: JSON.stringify(notes),
      });
    }
  });

  // Insertar el Catálogo leyendo cada archivo .musicxml desde public/scores
  INITIAL_SCORES.forEach((score) => {
    const relativePath = score.scoreFile.replace(/^\//, "");
    const fullXmlPath = path.join(publicDir, relativePath);
    let xmlContent = "";

    if (fs.existsSync(fullXmlPath)) {
      xmlContent = fs.readFileSync(fullXmlPath, "utf-8");
    } else {
      console.warn(`⚠️ No se encontró el archivo XML: ${fullXmlPath}`);
    }

    insertScore.run({
      ...score,
      musicxmlContent: xmlContent,
    });
  });
});

seedTransaction();
db.close();
console.log("✅ Base de datos database/seed.db creada con 90 ejercicios y las 9 partituras del catálogo.");