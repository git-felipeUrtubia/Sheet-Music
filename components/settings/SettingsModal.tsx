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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
            <div className="w-full max-w-lg bg-[#111C3D] border-2 border-blue-900/70 rounded-2xl p-6 md:p-8 shadow-2xl text-[#E2E8F0] animate-in fade-in zoom-in-95 duration-150">

                <div className="flex items-center justify-between pb-4 mb-6 border-b border-blue-900/50">
                    <div>
                        <h2 className="text-xl font-extrabold text-[#F1F5F9]">
                            Configuración del Sistema
                        </h2>
                        <p className="text-xs text-[#94A3B8]">
                            Ajusta tu instrumento MIDI, notación musical y metrónomo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-[#0A1128] hover:bg-[#162247] text-[#94A3B8] hover:text-white font-bold cursor-pointer transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-6">

                    {/* 1. Selector de Instrumento MIDI */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#0A1128] border border-blue-900/60">
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-blue-300">
                                🎹 Dispositivo de Entrada MIDI
                            </label>
                            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                                {isConnected ? 'Conectado' : 'Desconectado'}
                            </span>
                        </div>
                        <select
                            value={settings.selectedMidiId}
                            onChange={(e) =>
                                setSettings({ ...settings, selectedMidiId: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#111C3D] border border-blue-800/60 text-sm text-[#F1F5F9] focus:outline-none focus:border-blue-400 cursor-pointer"
                        >
                            <option value="default">Cualquier dispositivo MIDI USB (Automático)</option>
                            {availableDevices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.name}
                                </option>
                            ))}
                        </select>
                        {!isConnected && (
                            <p className="text-[11px] text-rose-300/80 mt-1">
                                Conecta tu piano digital por cable USB al computador para poder realizar los ejercicios.
                            </p>
                        )}
                    </div>

                    {/* 2. Sistema de Notación Musical */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
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
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-blue-600/20 border-blue-400 text-[#F1F5F9]"
                                                : "bg-[#0A1128] border-blue-900/50 text-[#94A3B8] hover:bg-[#162247]"
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{opt.title}</div>
                                        <div className="text-[11px] font-mono text-blue-300 mt-1">
                                            {opt.desc}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Volumen del Metrónomo */}
                    <div className="flex flex-col gap-2 bg-[#0A1128]/70 p-4 rounded-xl border border-blue-900/40">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                🔊 Volumen del Metrónomo
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
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
                            className="w-full accent-emerald-500 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-blue-900/50 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="text-xs font-semibold text-[#94A3B8] hover:text-rose-400 underline cursor-pointer transition-colors"
                    >
                        Restaurar valores
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-[#0A1128] hover:bg-[#162247] text-xs font-bold text-[#94A3B8] cursor-pointer transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-[#F1F5F9] shadow-lg cursor-pointer transition-all"
                        >
                            {savedBanner ? "¡Guardado! ✓" : "Guardar Cambios"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}