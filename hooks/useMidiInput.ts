// hooks/useMidiInput.ts
"use client";

/// <reference types="webmidi" />

import { useState, useEffect, useCallback, useRef } from "react";
import { loadAppSettings } from "@/types/settings";

export interface MidiDevice {
    id: string;
    name: string;
}

export function useMidiInput() {
    const [detectedMidi, setDetectedMidi] = useState<number | null>(null);
    const [noteHitId, setNoteHitId] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [availableDevices, setAvailableDevices] = useState<MidiDevice[]>([]);

    const midiAccessRef = useRef<MIDIAccess | null>(null);

    const handleMidiMessage = useCallback((message: MIDIMessageEvent) => {
        const data = message.data;
        if (!data || data.length < 3) return;

        const command = data[0];
        const note = data[1];
        const velocity = data[2];

        // 144 a 159 son comandos de "Note On" en los 16 canales MIDI
        const isNoteOn = command >= 144 && command <= 159;
        // 128 a 143 son comandos de "Note Off". Algunos pianos envían Note On con velocity 0 al soltar.
        const isNoteOff = (command >= 128 && command <= 143) || (isNoteOn && velocity === 0);

        if (isNoteOn && velocity > 0) {
            setDetectedMidi(note);
            setNoteHitId((prev) => prev + 1);
        } else if (isNoteOff) {
            // Liberar la nota solo si la tecla que se soltó es la misma que está marcada actualmente
            setDetectedMidi((prev) => (prev === note ? null : prev));
        }
    }, []);

    const attachListeners = useCallback((midiAccess: MIDIAccess) => {
        const settings = loadAppSettings();
        const targetId = settings.selectedMidiId;
        let hasConnection = false;
        const devices: MidiDevice[] = [];

        midiAccess.inputs.forEach((input) => {
            devices.push({ id: input.id, name: input.name || "Dispositivo MIDI Desconocido" });

            // Limpiar listeners previos por seguridad
            input.onmidimessage = null;

            // Conectar si es el seleccionado, o si está en "default" conectar el primero que encuentre
            if (targetId === "default" || targetId === input.id) {
                input.onmidimessage = handleMidiMessage;
                hasConnection = true;
            }
        });

        setAvailableDevices(devices);
        setIsConnected(hasConnection);
    }, [handleMidiMessage]);

    useEffect(() => {
        let mounted = true;

        const initMidi = async () => {
            try {
                if (!navigator.requestMIDIAccess) {
                    console.warn("WebMIDI no está soportado en este navegador.");
                    return;
                }

                const midiAccess = await navigator.requestMIDIAccess();
                if (!mounted) return;

                midiAccessRef.current = midiAccess;
                attachListeners(midiAccess);

                // Escuchar si el usuario conecta/desconecta el cable USB en caliente
                midiAccess.onstatechange = () => {
                    attachListeners(midiAccess);
                };
            } catch (err) {
                console.error("Error al acceder a los dispositivos MIDI:", err);
            }
        };

        initMidi();

        const handleSettingsChange = () => {
            if (midiAccessRef.current) {
                attachListeners(midiAccessRef.current);
            }
        };

        window.addEventListener("app-settings-updated", handleSettingsChange);
        return () => {
            mounted = false;
            window.removeEventListener("app-settings-updated", handleSettingsChange);
            if (midiAccessRef.current) {
                midiAccessRef.current.onstatechange = null;
                midiAccessRef.current.inputs.forEach((input) => {
                    input.onmidimessage = null;
                });
            }
        };
    }, [attachListeners]);

    return { detectedMidi, noteHitId, isConnected, availableDevices };
}