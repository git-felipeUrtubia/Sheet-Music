// components/settings/SettingsModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
    AppSettings,
    DEFAULT_SETTINGS,
    loadAppSettings,
    saveAppSettings,
    NotationSystem,
} from "@/types/settings";
import { useMidiInput } from "@/hooks/useMidiInput";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [savedBanner, setSavedBanner] = useState<boolean>(false);
    
    // Obtenemos los dispositivos conectados en tiempo real
    const { availableDevices, isConnected } = useMidiInput();

    useEffect(() => {
        if (isOpen) {
            setSettings(loadAppSettings());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        saveAppSettings(settings);
        setSavedBanner(true);
        setTimeout(() => {
            setSavedBanner(false);
            onClose();
        }, 500);
    };

    const handleResetDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
        saveAppSettings(DEFAULT_SETTINGS);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/25 p-4 backdrop-blur-md dark:bg-black/70">
            <div className="studio-fade w-full max-w-lg rounded-[1.8rem_2.3rem_1.6rem_2rem] border border-pink-200/80 bg-white/90 p-6 text-slate-800 shadow-2xl shadow-pink-200/40 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/90 dark:text-slate-100 dark:shadow-black/50 md:p-8">
                <div className="mb-6 flex items-start justify-between border-b border-pink-100 pb-4 dark:border-pink-500/15">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-400">
                            Estudio
                        </p>
                        <h2 className="mt-1 font-display text-3xl text-rose-950 dark:text-pink-50">
                            Configuración del Sistema
                        </h2>
                        <p className="mt-1 text-xs text-rose-900/60 dark:text-pink-100/55">
                            Ajusta tu instrumento MIDI, notación musical y metrónomo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-pink-200/80 bg-pink-50 text-sm font-bold text-rose-800 transition hover:bg-pink-100 dark:border-pink-500/25 dark:bg-slate-800 dark:text-pink-50"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2 rounded-[1.3rem] border border-pink-100 bg-rose-50/70 p-4 dark:border-pink-500/15 dark:bg-slate-950/50">
                        <div className="mb-1 flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500 dark:text-pink-300">
                                🎹 Dispositivo de Entrada MIDI
                            </label>
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${isConnected ? "text-emerald-600 dark:text-emerald-300" : "text-rose-500"}`}>
                                <span className={`h-2 w-2 rounded-full ${isConnected ? "animate-pulse bg-emerald-400" : "bg-rose-400"}`} />
                                {isConnected ? "Conectado" : "Desconectado"}
                            </span>
                        </div>
                        <select
                            value={settings.selectedMidiId}
                            onChange={(e) =>
                                setSettings({ ...settings, selectedMidiId: e.target.value })
                            }
                            className="w-full cursor-pointer rounded-2xl border border-pink-200/80 bg-white px-3.5 py-2.5 text-sm text-rose-950 focus:border-pink-400 focus:outline-none dark:border-pink-500/25 dark:bg-slate-900 dark:text-pink-50"
                        >
                            <option value="default">Cualquier dispositivo MIDI USB (Automático)</option>
                            {availableDevices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.name}
                                </option>
                            ))}
                        </select>
                        {!isConnected && (
                            <p className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-300/80">
                                Conecta tu piano digital por cable USB al computador para poder realizar los ejercicios.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500 dark:text-pink-300">
                            🎵 Nomenclatura de Notas
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            {(
                                [
                                    { id: "english", title: "Cifrado Americano", desc: "C • D • E • F • G • A • B" },
                                    { id: "solfege", title: "Solfeo Tradicional", desc: "Do • Re • Mi • Fa • Sol • La • Si" },
                                ] as { id: NotationSystem; title: string; desc: string }[]
                            ).map((opt) => {
                                const isSelected = settings.notation === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setSettings({ ...settings, notation: opt.id })}
                                        className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                                            isSelected
                                                ? "border-transparent bg-gradient-to-br from-pink-400 to-rose-400 text-rose-950 shadow-md shadow-pink-300/40"
                                                : "border-pink-200/80 bg-white/80 text-rose-900 hover:bg-pink-50 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{opt.title}</div>
                                        <div className={`mt-1 font-mono text-[11px] ${isSelected ? "text-rose-950/80" : "text-rose-400"}`}>
                                            {opt.desc}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-[1.3rem] border border-pink-100 bg-rose-50/70 p-4 dark:border-pink-500/15 dark:bg-slate-950/50">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-500 dark:text-pink-300">
                                🔊 Volumen del Metrónomo
                            </span>
                            <span className="font-mono text-xs font-bold text-rose-600 dark:text-pink-300">
                                {settings.metronomeVolume}%
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={settings.metronomeVolume}
                            onChange={(e) =>
                                setSettings({ ...settings, metronomeVolume: Number(e.target.value) })
                            }
                            className="w-full cursor-pointer accent-rose-400"
                        />
                    </div>
                </div>

                <div className="mt-7 flex items-center justify-between gap-3 border-t border-pink-100 pt-4 dark:border-pink-500/15">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="cursor-pointer text-xs font-semibold text-rose-400 underline decoration-rose-200 underline-offset-4 transition hover:text-rose-600"
                    >
                        Restaurar valores
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-full px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-pink-50 dark:text-pink-100 dark:hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-2 text-xs font-bold text-rose-950 shadow-lg shadow-pink-300/40"
                        >
                            {savedBanner ? "¡Guardado! ✓" : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}