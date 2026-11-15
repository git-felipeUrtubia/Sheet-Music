// data/scales.ts
// Catálogo pedagógico de escalas (Hanon, Czerny, ABRSM y Berklee).

export type ScaleLevel = "principiante" | "intermedio" | "avanzado";

export type ScaleFamily =
  | "mayor"
  | "menor-natural"
  | "menor-armonica"
  | "menor-melodica"
  | "pentatonica-mayor"
  | "pentatonica-menor"
  | "blues"
  | "cromatica"
  | "dorico"
  | "mixolidio";

export type AccidentalValue = -2 | -1 | 0 | 1 | 2;
export type AccidentalKind = "sharp" | "flat" | "none";

export interface ScaleDegree {
  name: string;
  letter: string;
  accidental: AccidentalValue;
  pitch: string;
  midi: number;
  octave: number;
  fingerRH: number;
  fingerLH: number;
}

export interface MusicalScale {
  id: string;
  name: string;
  tonic: string;
  family: ScaleFamily;
  familyLabel: string;
  signature: string;
  accidentals: number;
  accidentalKind: AccidentalKind;
  signatureLetters: string[];
  vexKey: string;
  formula: string;
  level: ScaleLevel;
  reference: string;
  fingeringRH: string;
  fingeringLH: string;
  ascending: ScaleDegree[];
  descending: ScaleDegree[];
}

export const SCALE_FAMILY_FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "mayor", label: "Mayor" },
  { id: "menor-natural", label: "Menor natural" },
  { id: "menor-armonica", label: "Menor armónica" },
  { id: "menor-melodica", label: "Menor melódica" },
  { id: "pentatonica", label: "Pentatónica" },
  { id: "blues", label: "Blues" },
  { id: "cromatica", label: "Cromática" },
  { id: "modo", label: "Modos" },
] as const;

export type ScaleFamilyFilter = (typeof SCALE_FAMILY_FILTERS)[number]["id"];

const LETTERS = ["c", "d", "e", "f", "g", "a", "b"] as const;
const BASE: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const SOLFEGE: Record<string, string> = {
  c: "Do",
  d: "Re",
  e: "Mi",
  f: "Fa",
  g: "Sol",
  a: "La",
  b: "Si",
};

const TONIC_NAME: Record<string, string> = {
  C: "Do",
  G: "Sol",
  D: "Re",
  A: "La",
  E: "Mi",
  B: "Si",
  F: "Fa",
  Bb: "Si bemol",
  Eb: "Mi bemol",
  Ab: "La bemol",
  Db: "Re bemol",
  Gb: "Sol bemol",
  "F#": "Fa sostenido",
  "C#": "Do sostenido",
};

const FORMULAS: Record<ScaleFamily, string> = {
  mayor: "T - T - S - T - T - T - S",
  "menor-natural": "T - S - T - T - S - T - T",
  "menor-armonica": "T - S - T - T - S - T+S - S",
  "menor-melodica": "T - S - T - T - T - T - S (sube) · natural al bajar",
  "pentatonica-mayor": "T - T - T+S - T - T+S",
  "pentatonica-menor": "T+S - T - T - T+S - T",
  blues: "T+S - T - S - S - T+S - T",
  cromatica: "S - S - S - S - S - S - S - S - S - S - S - S",
  dorico: "T - S - T - T - T - S - T",
  mixolidio: "T - T - S - T - T - S - T",
};

const FAMILY_LABEL: Record<ScaleFamily, string> = {
  mayor: "Mayor",
  "menor-natural": "Menor natural",
  "menor-armonica": "Menor armónica",
  "menor-melodica": "Menor melódica",
  "pentatonica-mayor": "Pentatónica mayor",
  "pentatonica-menor": "Pentatónica menor",
  blues: "Blues",
  cromatica: "Cromática",
  dorico: "Modo dórico",
  mixolidio: "Modo mixolidio",
};

/** Digitaciones de una octava, escuela Hanon / conservatorio. */
const MAJOR_FINGERS: Record<string, { rh: number[]; lh: number[] }> = {
  C: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  G: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  D: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  A: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  E: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  B: { rh: [1, 2, 3, 1, 2, 3, 4, 5], lh: [4, 3, 2, 1, 4, 3, 2, 1] },
  F: { rh: [1, 2, 3, 4, 1, 2, 3, 4], lh: [5, 4, 3, 2, 1, 3, 2, 1] },
  Bb: { rh: [2, 1, 2, 3, 1, 2, 3, 4], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Eb: { rh: [3, 1, 2, 3, 4, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Ab: { rh: [3, 4, 1, 2, 3, 1, 2, 3], lh: [3, 2, 1, 4, 3, 2, 1, 3] },
  Db: { rh: [2, 3, 1, 2, 3, 4, 1, 2], lh: [3, 2, 1, 4, 3, 2, 1, 2] },
  Gb: { rh: [2, 3, 4, 1, 2, 3, 1, 2], lh: [4, 3, 2, 1, 3, 2, 1, 2] },
};

interface KeyDef {
  id: string;
  tonic: string;
  letter: string;
  vexKey: string;
  accidentals: number;
  kind: AccidentalKind;
}

const MAJOR_KEYS: KeyDef[] = [
  { id: "c", tonic: "C", letter: "c", vexKey: "C", accidentals: 0, kind: "none" },
  { id: "g", tonic: "G", letter: "g", vexKey: "G", accidentals: 1, kind: "sharp" },
  { id: "d", tonic: "D", letter: "d", vexKey: "D", accidentals: 2, kind: "sharp" },
  { id: "a", tonic: "A", letter: "a", vexKey: "A", accidentals: 3, kind: "sharp" },
  { id: "e", tonic: "E", letter: "e", vexKey: "E", accidentals: 4, kind: "sharp" },
  { id: "b", tonic: "B", letter: "b", vexKey: "B", accidentals: 5, kind: "sharp" },
  { id: "f", tonic: "F", letter: "f", vexKey: "F", accidentals: 1, kind: "flat" },
  { id: "bb", tonic: "Bb", letter: "b", vexKey: "Bb", accidentals: 2, kind: "flat" },
  { id: "eb", tonic: "Eb", letter: "e", vexKey: "Eb", accidentals: 3, kind: "flat" },
  { id: "ab", tonic: "Ab", letter: "a", vexKey: "Ab", accidentals: 4, kind: "flat" },
  { id: "db", tonic: "Db", letter: "d", vexKey: "Db", accidentals: 5, kind: "flat" },
  { id: "gb", tonic: "Gb", letter: "g", vexKey: "Gb", accidentals: 6, kind: "flat" },
];

const MINOR_KEYS: KeyDef[] = [
  { id: "a", tonic: "A", letter: "a", vexKey: "Am", accidentals: 0, kind: "none" },
  { id: "e", tonic: "E", letter: "e", vexKey: "Em", accidentals: 1, kind: "sharp" },
  { id: "d", tonic: "D", letter: "d", vexKey: "Dm", accidentals: 1, kind: "flat" },
  { id: "g", tonic: "G", letter: "g", vexKey: "Gm", accidentals: 2, kind: "flat" },
  { id: "c", tonic: "C", letter: "c", vexKey: "Cm", accidentals: 3, kind: "flat" },
  { id: "fs", tonic: "F#", letter: "f", vexKey: "F#m", accidentals: 3, kind: "sharp" },
  { id: "cs", tonic: "C#", letter: "c", vexKey: "C#m", accidentals: 4, kind: "sharp" },
  { id: "b", tonic: "B", letter: "b", vexKey: "Bm", accidentals: 2, kind: "sharp" },
];

function fingerKey(tonic: string): string {
  if (tonic === "F#" || tonic === "Gb") return "Gb";
  if (tonic === "C#" || tonic === "Db") return "Db";
  return tonic;
}

function fingersFor(tonic: string): { rh: number[]; lh: number[] } {
  const fingers = MAJOR_FINGERS[fingerKey(tonic)];
  if (!fingers) throw new Error(`Sin digitación para ${tonic}`);
  return fingers;
}

function signatureLetters(count: number, kind: AccidentalKind): string[] {
  if (kind === "none" || count === 0) return [];
  const order = kind === "sharp" ? ["f", "c", "g", "d", "a", "e", "b"] : ["b", "e", "a", "d", "g", "c", "f"];
  return order.slice(0, count);
}

function signatureMap(count: number, kind: AccidentalKind): Record<string, AccidentalValue> {
  const map: Record<string, AccidentalValue> = { c: 0, d: 0, e: 0, f: 0, g: 0, a: 0, b: 0 };
  const delta: AccidentalValue = kind === "flat" ? -1 : 1;
  signatureLetters(count, kind).forEach((letter) => {
    map[letter] = delta;
  });
  return map;
}

function signatureText(count: number, kind: AccidentalKind): string {
  if (count === 0 || kind === "none") return "sin alteraciones";
  return `${count}${kind === "sharp" ? "♯" : "♭"}`;
}

function gradeFor(accidentals: number): string {
  if (accidentals <= 1) return "1";
  if (accidentals === 2) return "2";
  if (accidentals === 3) return "3";
  if (accidentals === 4) return "4";
  return "5";
}

function levelFor(family: ScaleFamily, accidentals: number): ScaleLevel {
  if (family === "cromatica" || family === "blues" || family === "menor-melodica") return "avanzado";
  if (family.startsWith("pentatonica") && accidentals === 0) return "principiante";
  if (
    family === "menor-armonica" ||
    family === "dorico" ||
    family === "mixolidio" ||
    family.startsWith("pentatonica")
  ) {
    return accidentals >= 3 ? "avanzado" : "intermedio";
  }
  if (accidentals <= 1) return "principiante";
  if (accidentals <= 3) return "intermedio";
  return "avanzado";
}

function toDegree(
  letter: string,
  accidental: AccidentalValue,
  octave: number,
  fingerRH: number,
  fingerLH: number,
): ScaleDegree {
  const suffix =
    accidental === 1 ? "#" : accidental === 2 ? "##" : accidental === -1 ? "b" : accidental === -2 ? "bb" : "";
  const glyph =
    accidental === 1 ? "♯" : accidental === 2 ? "♯♯" : accidental === -1 ? "♭" : accidental === -2 ? "♭♭" : "";
  return {
    name: `${SOLFEGE[letter]}${glyph}`,
    letter,
    accidental,
    pitch: `${letter}${suffix}/${octave}`,
    midi: (octave + 1) * 12 + BASE[letter] + accidental,
    octave,
    fingerRH,
    fingerLH,
  };
}

function diatonic(
  tonicLetter: string,
  startOctave: number,
  accMap: Record<string, AccidentalValue>,
  raises: number[],
  fingers: { rh: number[]; lh: number[] },
): ScaleDegree[] {
  const notes: ScaleDegree[] = [];
  let octave = startOctave;
  let letterIndex = LETTERS.indexOf(tonicLetter as (typeof LETTERS)[number]);
  for (let degree = 0; degree < 8; degree += 1) {
    const letter = LETTERS[letterIndex];
    const raised = raises.includes(degree) ? ((accMap[letter] + 1) as AccidentalValue) : accMap[letter];
    notes.push(toDegree(letter, raised, octave, fingers.rh[degree], fingers.lh[degree]));
    letterIndex = (letterIndex + 1) % 7;
    if (letterIndex === 0) octave += 1;
  }
  return notes;
}

function withFingers(notes: ScaleDegree[], rh: number[], lh: number[]): ScaleDegree[] {
  return notes.map((note, index) => ({
    ...note,
    fingerRH: rh[index],
    fingerLH: lh[index],
  }));
}

function reverseScale(notes: ScaleDegree[], fingers: { rh: number[]; lh: number[] }): ScaleDegree[] {
  const rh = [...fingers.rh].reverse();
  const lh = [...fingers.lh].reverse();
  return [...notes].reverse().map((note, index) => ({
    ...note,
    fingerRH: rh[index],
    fingerLH: lh[index],
  }));
}

function joinFingers(notes: ScaleDegree[], hand: "fingerRH" | "fingerLH"): string {
  return notes.map((note) => note[hand]).join("-");
}

interface BuiltScale {
  id: string;
  name: string;
  tonic: string;
  family: ScaleFamily;
  vexKey: string;
  accidentals: number;
  kind: AccidentalKind;
  reference: string;
  ascending: ScaleDegree[];
  descending: ScaleDegree[];
}

function finish(scale: BuiltScale): MusicalScale {
  const level = levelFor(scale.family, scale.accidentals);
  return {
    id: scale.id,
    name: scale.name,
    tonic: scale.tonic,
    family: scale.family,
    familyLabel: FAMILY_LABEL[scale.family],
    signature: signatureText(scale.accidentals, scale.kind),
    accidentals: scale.accidentals,
    accidentalKind: scale.kind,
    signatureLetters: signatureLetters(scale.accidentals, scale.kind),
    vexKey: scale.vexKey,
    formula: FORMULAS[scale.family],
    level,
    reference: scale.reference,
    fingeringRH: joinFingers(scale.ascending, "fingerRH"),
    fingeringLH: joinFingers(scale.ascending, "fingerLH"),
    ascending: scale.ascending,
    descending: scale.descending,
  };
}

function buildMajor(key: KeyDef): MusicalScale {
  const fingers = fingersFor(key.tonic);
  const ascending = diatonic(key.letter, 4, signatureMap(key.accidentals, key.kind), [], fingers);
  return finish({
    id: `mayor-${key.id}`,
    name: `${TONIC_NAME[key.tonic]} Mayor`,
    tonic: key.tonic,
    family: "mayor",
    vexKey: key.vexKey,
    accidentals: key.accidentals,
    kind: key.kind,
    reference: `Hanon N° 39 · Czerny op. 299 / ABRSM Grado ${gradeFor(key.accidentals)}`,
    ascending,
    descending: reverseScale(ascending, fingers),
  });
}

function buildMinor(key: KeyDef, form: "natural" | "armonica" | "melodica"): MusicalScale {
  const family: ScaleFamily =
    form === "natural" ? "menor-natural" : form === "armonica" ? "menor-armonica" : "menor-melodica";
  const label = form === "natural" ? "natural" : form === "armonica" ? "armónica" : "melódica";
  const fingers = fingersFor(key.tonic);
  const map = signatureMap(key.accidentals, key.kind);
  const natural = diatonic(key.letter, 4, map, [], fingers);
  const raises = form === "armonica" ? [6] : form === "melodica" ? [5, 6] : [];
  const ascending = form === "natural" ? natural : diatonic(key.letter, 4, map, raises, fingers);
  const descending = form === "melodica" ? reverseScale(natural, fingers) : reverseScale(ascending, fingers);
  const reference =
    form === "melodica"
      ? `Hanon N° 39 · menor melódica / ABRSM Grado ${gradeFor(key.accidentals)}`
      : form === "armonica"
        ? `Hanon N° 39 · menor armónica / ABRSM Grado ${gradeFor(key.accidentals)}`
        : `Hanon N° 39 / ABRSM Grado ${gradeFor(key.accidentals)}`;
  return finish({
    id: `menor-${form}-${key.id}`,
    name: `${TONIC_NAME[key.tonic]} menor ${label}`,
    tonic: key.tonic,
    family,
    vexKey: key.vexKey,
    accidentals: key.accidentals,
    kind: key.kind,
    reference,
    ascending,
    descending,
  });
}

function buildPentatonic(key: KeyDef, mode: "mayor" | "menor"): MusicalScale {
  const family: ScaleFamily = mode === "mayor" ? "pentatonica-mayor" : "pentatonica-menor";
  const fingers = fingersFor(key.tonic);
  const source =
    mode === "mayor"
      ? diatonic(key.letter, 4, signatureMap(key.accidentals, key.kind), [], fingers)
      : diatonic(key.letter, 4, signatureMap(key.accidentals, key.kind), [], fingers);
  const indexes = mode === "mayor" ? [0, 1, 2, 4, 5, 7] : [0, 2, 3, 4, 6, 7];
  const rh = [1, 2, 3, 1, 2, 3];
  const lh = [5, 4, 3, 1, 2, 1];
  const ascending = withFingers(
    indexes.map((index) => source[index]),
    rh,
    lh,
  );
  return finish({
    id: `pentatonica-${mode}-${key.id}`,
    name: `Pentatónica ${mode} de ${TONIC_NAME[key.tonic]}`,
    tonic: key.tonic,
    family,
    vexKey: key.vexKey,
    accidentals: key.accidentals,
    kind: key.kind,
    reference: "Berklee, improvisación / escala pentatónica",
    ascending,
    descending: reverseScale(ascending, { rh, lh }),
  });
}

function buildManual(
  partial: Omit<BuiltScale, "ascending" | "descending"> & {
    asc: [string, AccidentalValue, number][];
    desc: [string, AccidentalValue, number][];
    rh: number[];
    lh: number[];
  },
): MusicalScale {
  const ascending = withFingers(
    partial.asc.map(([letter, accidental, octave]) => toDegree(letter, accidental, octave, 1, 1)),
    partial.rh,
    partial.lh,
  );
  const descending = withFingers(
    partial.desc.map(([letter, accidental, octave]) => toDegree(letter, accidental, octave, 1, 1)),
    [...partial.rh].reverse(),
    [...partial.lh].reverse(),
  );
  return finish({ ...partial, ascending, descending });
}

function buildCatalog(): MusicalScale[] {
  const scales: MusicalScale[] = MAJOR_KEYS.map(buildMajor);

  MINOR_KEYS.forEach((key) => {
    scales.push(buildMinor(key, "natural"));
    scales.push(buildMinor(key, "armonica"));
    scales.push(buildMinor(key, "melodica"));
  });

  (
    [
      ["c", "C", "c", "C", 0, "none"],
      ["g", "G", "g", "G", 1, "sharp"],
      ["d", "D", "d", "D", 2, "sharp"],
      ["a", "A", "a", "A", 3, "sharp"],
    ] as const
  ).forEach(([id, tonic, letter, vexKey, accidentals, kind]) => {
    scales.push(buildPentatonic({ id, tonic, letter, vexKey, accidentals, kind }, "mayor"));
  });

  (
    [
      ["a", "A", "a", "Am", 0, "none"],
      ["e", "E", "e", "Em", 1, "sharp"],
      ["d", "D", "d", "Dm", 1, "flat"],
    ] as const
  ).forEach(([id, tonic, letter, vexKey, accidentals, kind]) => {
    scales.push(buildPentatonic({ id, tonic, letter, vexKey, accidentals, kind }, "menor"));
  });

  const bluesRH = [1, 2, 3, 4, 1, 2, 3];
  const bluesLH = [5, 4, 3, 1, 2, 3, 1];
  scales.push(
    buildManual({
      id: "blues-c",
      name: "Escala de blues en Do",
      tonic: "C",
      family: "blues",
      vexKey: "C",
      accidentals: 0,
      kind: "none",
      reference: "Berklee, escala de blues / improvisación",
      rh: bluesRH,
      lh: bluesLH,
      asc: [
        ["c", 0, 4],
        ["e", -1, 4],
        ["f", 0, 4],
        ["f", 1, 4],
        ["g", 0, 4],
        ["b", -1, 4],
        ["c", 0, 5],
      ],
      desc: [
        ["c", 0, 5],
        ["b", -1, 4],
        ["g", 0, 4],
        ["f", 1, 4],
        ["f", 0, 4],
        ["e", -1, 4],
        ["c", 0, 4],
      ],
    }),
  );
  scales.push(
    buildManual({
      id: "blues-a",
      name: "Escala de blues en La",
      tonic: "A",
      family: "blues",
      vexKey: "C",
      accidentals: 0,
      kind: "none",
      reference: "Berklee, escala de blues / improvisación",
      rh: bluesRH,
      lh: bluesLH,
      asc: [
        ["a", 0, 4],
        ["c", 0, 5],
        ["d", 0, 5],
        ["e", -1, 5],
        ["e", 0, 5],
        ["g", 0, 5],
        ["a", 0, 5],
      ],
      desc: [
        ["a", 0, 5],
        ["g", 0, 5],
        ["e", 0, 5],
        ["e", -1, 5],
        ["d", 0, 5],
        ["c", 0, 5],
        ["a", 0, 4],
      ],
    }),
  );

  const chromRH = [1, 3, 1, 3, 1, 2, 3, 1, 3, 1, 3, 1, 2];
  const chromLH = [1, 3, 1, 3, 2, 1, 3, 1, 3, 1, 3, 2, 1];
  scales.push(
    buildManual({
      id: "cromatica-c",
      name: "Escala cromática de Do",
      tonic: "C",
      family: "cromatica",
      vexKey: "C",
      accidentals: 0,
      kind: "none",
      reference: "Hanon N° 40 / Escala cromática",
      rh: chromRH,
      lh: chromLH,
      asc: [
        ["c", 0, 4],
        ["c", 1, 4],
        ["d", 0, 4],
        ["d", 1, 4],
        ["e", 0, 4],
        ["f", 0, 4],
        ["f", 1, 4],
        ["g", 0, 4],
        ["g", 1, 4],
        ["a", 0, 4],
        ["a", 1, 4],
        ["b", 0, 4],
        ["c", 0, 5],
      ],
      desc: [
        ["c", 0, 5],
        ["b", 0, 4],
        ["b", -1, 4],
        ["a", 0, 4],
        ["a", -1, 4],
        ["g", 0, 4],
        ["g", -1, 4],
        ["f", 0, 4],
        ["e", 0, 4],
        ["e", -1, 4],
        ["d", 0, 4],
        ["d", -1, 4],
        ["c", 0, 4],
      ],
    }),
  );

  const mode = (
    id: string,
    name: string,
    tonic: string,
    letter: string,
    family: "dorico" | "mixolidio",
    vexKey: string,
    accidentals: number,
    kind: AccidentalKind,
  ) => {
    const fingers = fingersFor(tonic);
    const ascending = diatonic(letter, 4, signatureMap(accidentals, kind), [], fingers);
    scales.push(
      finish({
        id,
        name,
        tonic,
        family,
        vexKey,
        accidentals,
        kind,
        reference: "Berklee Harmony / modos griegos esenciales",
        ascending,
        descending: reverseScale(ascending, fingers),
      }),
    );
  };

  mode("dorico-d", "Re dórico", "D", "d", "dorico", "C", 0, "none");
  mode("dorico-a", "La dórico", "A", "a", "dorico", "G", 1, "sharp");
  mode("mixolidio-g", "Sol mixolidio", "G", "g", "mixolidio", "C", 0, "none");
  mode("mixolidio-d", "Re mixolidio", "D", "d", "mixolidio", "G", 1, "sharp");

  return scales;
}

export const SCALES: MusicalScale[] = buildCatalog();

const seen = new Set<string>();
for (const scale of SCALES) {
  if (seen.has(scale.id)) throw new Error(`Escala duplicada: ${scale.id}`);
  seen.add(scale.id);
  if (scale.ascending.length !== scale.descending.length) {
    throw new Error(`Longitud desigual en ${scale.id}`);
  }
  for (const note of [...scale.ascending, ...scale.descending]) {
    if (!Number.isFinite(note.midi) || note.fingerRH < 1 || note.fingerRH > 5 || note.fingerLH < 1 || note.fingerLH > 5) {
      throw new Error(`Nota inválida en ${scale.id}: ${note.pitch}`);
    }
  }
}

export function scaleMatchesFamily(scale: MusicalScale, filter: ScaleFamilyFilter): boolean {
  if (filter === "todas") return true;
  if (filter === "pentatonica") return scale.family.startsWith("pentatonica");
  if (filter === "modo") return scale.family === "dorico" || scale.family === "mixolidio";
  return scale.family === filter;
}
