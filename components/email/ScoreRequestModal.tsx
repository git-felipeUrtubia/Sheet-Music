"use client";
import React, { useState } from "react";

// Pega aquí la URL de tu Webhook (o guárdala en NEXT_PUBLIC_SCORE_WEBHOOK_URL en tu .env.local)
const WEBHOOK_URL = "https://discord.com/api/webhooks/1571312953578364930/_Scou5lZG7NvgASChTRUKgb3nXcVlPHveLSI6ucyowzuks0LomZXlkkpn4lMmw7BhKRJ";

interface ScoreRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScoreRequestModal({ isOpen, onClose }: ScoreRequestModalProps) {
  const [title, setTitle] = useState("");
  const [composer, setComposer] = useState("");
  const [instrument, setInstrument] = useState("Piano");
  const [level, setLevel] = useState("Intermedio");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("El archivo no debe superar los 10 MB.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const formData = new FormData();

      // Estructura del mensaje enriquecido con los metadatos de la partitura
      const payload = {
        username: "SheetMusic Bot",
        embeds: [
          {
            title: `🎵 Nueva Solicitud: ${title}`,
            color: 3899126, // Azul eléctrico (#3B82F6)
            fields: [
              { name: "Autor / Anime / Juego", value: composer || "No especificado", inline: true },
              { name: "Instrumento", value: instrument, inline: true },
              { name: "Nivel sugerido", value: level, inline: true },
              { name: "Notas del usuario", value: notes || "Sin comentarios adicionales", inline: false },
              { name: "Archivo adjunto", value: `\`${file.name}\` (${(file.size / 1024).toFixed(1)} KB)`, inline: false },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      };

      formData.append("payload_json", JSON.stringify(payload));
      formData.append("file", file, file.name);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el archivo al servidor.");
      }

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setTitle("");
        setComposer("");
        setNotes("");
        setFile(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error de conexión al enviar la partitura.");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cyan-400">Sugerir Partitura</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-xs text-slate-400">
          Adjunta tu partitura en formato <strong>MusicXML (.xml / .mxl)</strong> o <strong>PDF</strong> para que podamos incluirla en futuras actualizaciones del catálogo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300">Nombre de la obra *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Gurenge / Sadness and Sorrow"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">Autor / Anime / Obra</label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Ej: Kimetsu no Yaiba"
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Instrumento</label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Piano">Piano</option>
                <option value="Violin">Violín</option>
                <option value="Flute">Flauta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Nivel estimado</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Archivo (.musicxml, .xml, .mxl, .pdf) *
            </label>
            <input
              type="file"
              required
              accept=".xml,.musicxml,.mxl,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-xs text-slate-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-cyan-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Comentarios (opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Arreglo en clave de sol y fa..."
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {status === "error" && <p className="text-xs text-red-400">{errorMsg}</p>}
          {status === "success" && (
            <p className="text-xs font-medium text-emerald-400">
              ¡Solicitud enviada! Revisaremos tu partitura para la próxima actualización.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Enviando..." : "Enviar Partitura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}