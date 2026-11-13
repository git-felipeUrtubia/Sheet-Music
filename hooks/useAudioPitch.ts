// hooks/useAudioPitch.ts
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { loadAppSettings } from "@/types/settings";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function frequencyToMidi(frequency: number): { midi: number; noteName: string } | null {
  if (frequency < 55 || frequency > 2000 || !isFinite(frequency)) return null;

  const midiFloat = 12 * Math.log2(frequency / 440) + 69;
  const midi = Math.round(midiFloat);

  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const noteName = `${NOTE_NAMES[noteIndex]}${octave}`;

  return { midi, noteName };
}

function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number,
  minRms: number,
  minClarity: number
): number {
  const SIZE = buffer.length;

  // 1. Centrar la onda (quitar cualquier offset del micrófono) y medir volumen RMS
  let mean = 0;
  for (let i = 0; i < SIZE; i++) {
    mean += buffer[i];
  }
  mean /= SIZE;

  let rms = 0;
  let maxPeak = 0;
  const centered = new Float32Array(SIZE);

  for (let i = 0; i < SIZE; i++) {
    const val = buffer[i] - mean;
    centered[i] = val;
    rms += val * val;
    const abs = Math.abs(val);
    if (abs > maxPeak) maxPeak = abs;
  }
  rms = Math.sqrt(rms / SIZE);

  // Puerta de silencio muy baja: nunca bloquea al piano ni siquiera en Nivel 10
  if (rms < minRms || maxPeak === 0) return -1;

  // 2. Normalizar la onda entre -1 y 1 para que la distancia al piano no afecte la lectura
  const norm = new Float32Array(SIZE);
  for (let i = 0; i < SIZE; i++) {
    norm[i] = centered[i] / maxPeak;
  }

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;

  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(norm[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(norm[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const sliced = norm.slice(r1, r2);
  const newSize = sliced.length;
  if (newSize < 64) return -1;

  // 3. Autocorrelación clásica rápida
  const c = new Float32Array(newSize).fill(0);
  for (let i = 0; i < newSize; i++) {
    let sum = 0;
    for (let j = 0; j < newSize - i; j++) {
      sum += sliced[j] * sliced[j + i];
    }
    c[i] = sum;
  }

  if (c[0] <= 0) return -1;

  let d = 0;
  while (d < newSize - 1 && c[d] > c[d + 1]) {
    d++;
  }

  const minLag = Math.floor(sampleRate / 2000);
  if (d < minLag) d = minLag;

  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  // 4. Filtro inteligente de ruido de fondo:
  // En vez de exigir volumen alto, exige que el sonido sea armónico (nota de piano vs ruido ambiente)
  const clarity = maxval / c[0];
  if (clarity < minClarity) return -1;

  let T0 = maxpos;
  if (T0 <= 0) return -1;

  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

/**
 * Convierte el nivel 1..10 del slider en dos parámetros equilibrados:
 * - minRms: se mantiene siempre bajo (0.0005 a 0.0032) para que el Nivel 10 NUNCA deje sordo al micrófono.
 * - minClarity: sube de 0.18 a 0.45 para rechazar ruido de fondo sin perder sensibilidad en el piano.
 */
function getFilterParams(sensitivity: number = 5): { minRms: number; minClarity: number } {
  const s = Math.max(1, Math.min(10, Number(sensitivity) || 5));
  const minRms = 0.0005 + (s - 1) * 0.0003;     // Nivel 1: 0.0005 | Nivel 5: 0.0017 | Nivel 10: 0.0032
  const minClarity = 0.18 + (s - 1) * 0.03;     // Nivel 1: 0.18   | Nivel 5: 0.30   | Nivel 10: 0.45
  return { minRms, minClarity };
}

export function useAudioPitch() {
  const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
  const [detectedNoteName, setDetectedNoteName] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const filterParamsRef = useRef<{ minRms: number; minClarity: number }>(getFilterParams(5));
  const isListeningRef = useRef<boolean>(false);
  const currentMicIdRef = useRef<string>("default");

  const stopListening = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    isListeningRef.current = false;
    setIsListening(false);
    setDetectedMidi(null);
    setDetectedNoteName(null);
  }, []);

  const startListening = useCallback(async () => {
    const settings = loadAppSettings();

    if (settings.micEnabled === false) {
      stopListening();
      return;
    }

    filterParamsRef.current = getFilterParams(settings.micSensitivity);
    currentMicIdRef.current = settings.selectedMicId || "default";

    try {
      stopListening();

      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: false,
        autoGainControl: true, // Mantiene volumen estable en micrófonos de Windows
        noiseSuppression: false,
      };

      if (settings.selectedMicId && settings.selectedMicId !== "default") {
        audioConstraints.deviceId = { ideal: settings.selectedMicId };
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(stream);

      // 1. Filtro Pasa-Altos (80 Hz): limpia el zumbido grave del ambiente/PC
      const highpassFilter = ctx.createBiquadFilter();
      highpassFilter.type = "highpass";
      highpassFilter.frequency.value = 80;

      // 2. Pre-amplificador (GainNode 3.5x): refuerza la señal del piano para que nunca quede débil
      const preAmp = ctx.createGain();
      preAmp.gain.value = 3.5;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;

      // Cadena de audio: Micrófono -> Filtro 80Hz -> Pre-Amp 3.5x -> Analizador
      source.connect(highpassFilter);
      highpassFilter.connect(preAmp);
      preAmp.connect(analyser);

      analyserRef.current = analyser;

      isListeningRef.current = true;
      setIsListening(true);

      const buffer = new Float32Array(analyser.fftSize);

      const detectLoop = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume().catch(() => {});
        }

        analyserRef.current.getFloatTimeDomainData(buffer);

        const { minRms, minClarity } = filterParamsRef.current;
        const freq = autoCorrelate(
          buffer,
          audioContextRef.current.sampleRate,
          minRms,
          minClarity
        );

        if (freq !== -1) {
          const noteInfo = frequencyToMidi(freq);
          if (noteInfo) {
            setDetectedMidi(noteInfo.midi);
            setDetectedNoteName(noteInfo.noteName);
          } else {
            setDetectedMidi(null);
            setDetectedNoteName(null);
          }
        } else {
          setDetectedMidi(null);
          setDetectedNoteName(null);
        }

        rafIdRef.current = requestAnimationFrame(detectLoop);
      };

      rafIdRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      console.error("Error al iniciar el micrófono:", err);
      stopListening();
    }
  }, [stopListening]);

  useEffect(() => {
    startListening();

    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      stopListening();
    };
  }, [startListening, stopListening]);

  useEffect(() => {
    const syncSettings = () => {
      const current = loadAppSettings();
      filterParamsRef.current = getFilterParams(current.micSensitivity);

      if (current.micEnabled === false) {
        if (isListeningRef.current) stopListening();
      } else if (
        !isListeningRef.current ||
        (current.selectedMicId || "default") !== currentMicIdRef.current
      ) {
        startListening();
      }
    };

    window.addEventListener("storage", syncSettings);
    window.addEventListener("app-settings-updated", syncSettings);
    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("app-settings-updated", syncSettings);
    };
  }, [startListening, stopListening]);

  return {
    detectedMidi,
    detectedNoteName,
    isListening,
    startListening,
    stopListening,
  };
}