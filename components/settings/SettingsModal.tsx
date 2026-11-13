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

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
    const [savedBanner, setSavedBanner] = useState<boolean>(false);

    // Cargar ajustes guardados al abrir el modal
    useEffect(() => {
        if (!isOpen) return;
        const current = loadAppSettings();
        setSettings(current);
    }, [isOpen]);

    // Listar micrófonos solo cuando el modal esté abierto Y el micrófono esté habilitado
    useEffect(() => {
        if (!isOpen || !settings.micEnabled) return;

        const fetchMicrophones = async () => {
            try {
                let devices = await navigator.mediaDevices.enumerateDevices();
                let mics = devices.filter((device) => device.kind === "audioinput");

                // Solo abrir un stream temporal si el navegador aún no revela los nombres de los micrófonos
                if (mics.length === 0 || !mics[0].label) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach((track) => track.stop());
                    devices = await navigator.mediaDevices.enumerateDevices();
                    mics = devices.filter((device) => device.kind === "audioinput");
                }

                setAudioInputs(mics);
            } catch (err) {
                console.warn("No se pudieron listar los micrófonos:", err);
            }
        };

        fetchMicrophones();
    }, [isOpen, settings.micEnabled]);

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

                {/* Encabezado limpio del Modal */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-blue-900/50">
                    <div>
                        <h2 className="text-xl font-extrabold text-[#F1F5F9]">
                            Configuración del Sistema
                        </h2>
                        <p className="text-xs text-[#94A3B8]">
                            Ajusta tu micrófono, notación musical y niveles de audio.
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

                {/* Cuerpo de ajustes */}
                <div className="flex flex-col gap-5">

                    {/* 0. Interruptor de Uso/Desuso del Micrófono */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#0A1128] border border-blue-900/60">
                        <div>
                            <div className="text-sm font-bold text-[#F1F5F9]">
                                Permitir uso del micrófono
                            </div>
                            <p className="text-xs text-[#94A3B8] mt-0.5">
                                Activa o desactiva la detección de notas por audio en los ejercicios.
                            </p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={settings.micEnabled}
                            onClick={() =>
                                setSettings((prev) => ({ ...prev, micEnabled: !prev.micEnabled }))
                            }
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.micEnabled ? "bg-emerald-500" : "bg-slate-700"
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${settings.micEnabled ? "translate-x-5" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* 1. Selector de Micrófono */}
                    <div className={`flex flex-col gap-2 transition-opacity ${!settings.micEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                        <label className="text-xs font-bold uppercase tracking-wider text-blue-300">
                            🎤 Dispositivo de Entrada (Micrófono)
                        </label>
                        <select
                            value={settings.selectedMicId}
                            disabled={!settings.micEnabled}
                            onChange={(e) =>
                                setSettings({ ...settings, selectedMicId: e.target.value })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A1128] border border-blue-800/60 text-sm text-[#F1F5F9] focus:outline-none focus:border-blue-400 cursor-pointer"
                        >
                            <option value="default">Micrófono predeterminado del sistema</option>
                            {audioInputs.map((mic, idx) => (
                                <option key={mic.deviceId || idx} value={mic.deviceId}>
                                    {mic.label || `Micrófono ${idx + 1}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Sensibilidad / Filtro de Ruido */}
                    <div className={`flex flex-col gap-2 bg-[#0A1128]/70 p-4 rounded-xl border border-blue-900/40 transition-opacity ${!settings.micEnabled ? "opacity-40 pointer-events-none" : ""}`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                                Filtro de Ruido Ambiente
                            </span>
                            <span className="text-xs font-mono font-bold text-blue-400">
                                Nivel {settings.micSensitivity} / 10
                            </span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={10}
                            step={1}
                            disabled={!settings.micEnabled}
                            value={settings.micSensitivity}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    micSensitivity: Number(e.target.value),
                                })
                            }
                            className="w-full accent-blue-500 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#94A3B8]">
                            <span>Más sensible (Capta sonidos suaves)</span>
                            <span>Más estricto (Ignora ruido de fondo)</span>
                        </div>
                    </div>

                    {/* 3. Sistema de Notación Musical */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                            🎵 Nomenclatura de Notas
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                            {(
                                [
                                    {
                                        id: "english",
                                        title: "Cifrado Americano",
                                        desc: "C • D • E • F • G • A • B",
                                    },
                                    {
                                        id: "solfege",
                                        title: "Solfeo Tradicional",
                                        desc: "Do • Re • Mi • Fa • Sol • La • Si",
                                    },
                                ] as { id: NotationSystem; title: string; desc: string }[]
                            ).map((opt) => {
                                const isSelected = settings.notation === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() =>
                                            setSettings({ ...settings, notation: opt.id })
                                        }
                                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${isSelected
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

                    {/* 4. Volumen del Metrónomo */}
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
                                setSettings({
                                    ...settings,
                                    metronomeVolume: Number(e.target.value),
                                })
                            }
                            className="w-full accent-emerald-500 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Botones de Acción Inferiores */}
                <div className="mt-8 pt-4 border-t border-blue-900/50 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="text-xs font-semibold text-[#94A3B8] hover:text-rose-400 underline cursor-pointer transition-colors"
                    >
                        Restaurar valores por defecto
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