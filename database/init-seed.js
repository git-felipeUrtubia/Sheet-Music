/* eslint-disable @typescript-eslint/no-require-imports */
// database/init-seed.js
const { SHEET_MUSIC_CATALOG } = require("../data/catalog");
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

  CREATE TABLE scales (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tonic TEXT NOT NULL,
    family TEXT NOT NULL,
    family_label TEXT NOT NULL,
    signature TEXT NOT NULL,
    accidentals INTEGER NOT NULL,
    accidental_kind TEXT NOT NULL,
    formula TEXT NOT NULL,
    level TEXT NOT NULL,
    reference TEXT NOT NULL,
    fingering_rh TEXT NOT NULL,
    fingering_lh TEXT NOT NULL,
    payload_json TEXT NOT NULL
  );

  CREATE INDEX idx_scales_filters ON scales(family, level, accidentals);

  CREATE TABLE scale_progress (
    scale_id TEXT PRIMARY KEY,
    mastered INTEGER DEFAULT 0,
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
const INITIAL_SCORES = SHEET_MUSIC_CATALOG;

const insertExercise = db.prepare(`
  INSERT INTO exercises (id, title, level, clef, time_signature, notes_json)
  VALUES (@id, @title, @level, @clef, @timeSignature, @notesJson)
`);

const insertScale = db.prepare(`
  INSERT INTO scales (
    id, name, tonic, family, family_label, signature, accidentals, accidental_kind,
    formula, level, reference, fingering_rh, fingering_lh, payload_json
  ) VALUES (
    @id, @name, @tonic, @family, @familyLabel, @signature, @accidentals, @accidentalKind,
    @formula, @level, @reference, @fingeringRH, @fingeringLH, @payloadJson
  )
`);

const SCALES = loadScales();

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

  SCALES.forEach((scale) => {
    insertScale.run({
      id: scale.id,
      name: scale.name,
      tonic: scale.tonic,
      family: scale.family,
      familyLabel: scale.familyLabel,
      signature: scale.signature,
      accidentals: scale.accidentals,
      accidentalKind: scale.accidentalKind,
      formula: scale.formula,
      level: scale.level,
      reference: scale.reference,
      fingeringRH: scale.fingeringRH,
      fingeringLH: scale.fingeringLH,
      payloadJson: JSON.stringify(scale),
    });
  });
});

function loadTsExport(relativePath, exportName) {
  try {
    const ts = require("typescript");
    const Module = require("module");
    const sourcePath = path.join(dbDir, "..", relativePath);
    const source = fs.readFileSync(sourcePath, "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    });

    const loaded = new Module(sourcePath);
    loaded.filename = sourcePath;
    loaded.paths = Module._nodeModulePaths(path.dirname(sourcePath));
    loaded._compile(outputText, sourcePath);
    return loaded.exports[exportName] || [];
  } catch (error) {
    console.warn(`⚠️ No se pudo cargar ${exportName} desde ${relativePath}:`, error.message);
    return [];
  }
}

function loadTheoryLessons() {
  return loadTsExport(path.join("data", "theoryLessons.ts"), "THEORY_CHAPTERS");
}

function loadScales() {
  return loadTsExport(path.join("data", "scales.ts"), "SCALES");
}

function mapExercise(row) {
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    clef: row.clef,
    timeSignature: row.time_signature,
    notes: JSON.parse(row.notes_json),
  };
}

function mapScore(row) {
  return {
    id: row.id,
    title: row.title,
    composer: row.composer,
    level: row.level,
    genre: row.genre,
    instrument: row.instrument,
    clef: row.clef,
    timeSignature: row.time_signature,
    bpm: row.bpm,
    measuresCount: row.measures_count,
    scoreFile: row.score_file,
  };
}

// El XML completo se queda en SQLite para Electron.
// En la web los .musicxml / .pdf se leen desde /scores/...
function exportWebDatabase() {
  const exercises = db.prepare("SELECT * FROM exercises ORDER BY rowid").all().map(mapExercise);
  const scores = db
    .prepare(`
      SELECT id, title, composer, level, genre, instrument, clef,
             time_signature, bpm, measures_count, score_file
      FROM scores
      ORDER BY rowid
    `)
    .all()
    .map(mapScore);
  const lessons = loadTheoryLessons();
  const scales = db
    .prepare("SELECT payload_json FROM scales ORDER BY rowid")
    .all()
    .map((row) => JSON.parse(row.payload_json));

  const payload = {
    generatedAt: new Date().toISOString(),
    scores,
    exercises,
    lessons,
    scales,
  };

  const outPath = path.join(publicDir, "web-db.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `✅ Catálogo web exportado en public/web-db.json (${scores.length} partituras, ${exercises.length} ejercicios, ${lessons.length} lecciones, ${scales.length} escalas).`
  );
}

seedTransaction();
exportWebDatabase();
db.close();
console.log("✅ Base de datos database/seed.db creada con ejercicios, partituras y el laboratorio de escalas.");