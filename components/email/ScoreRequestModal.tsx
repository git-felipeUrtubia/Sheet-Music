"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

// Pega aquí la URL de tu Webhook (o guárdala en NEXT_PUBLIC_SCORE_WEBHOOK_URL en tu .env.local)
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;

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

  const fieldClass =
    "mt-1 w-full rounded-2xl border border-pink-200/80 bg-white/80 px-3.5 py-2.5 text-sm text-rose-950 placeholder:text-rose-300 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200 dark:border-pink-500/25 dark:bg-slate-950/60 dark:text-pink-50 dark:placeholder:text-slate-500 dark:focus:ring-pink-500/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/25 p-4 backdrop-blur-md dark:bg-black/70">
      <div className="studio-fade max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[1.8rem_2.3rem_1.6rem_2rem] border border-pink-200/80 bg-white/92 p-6 text-slate-800 shadow-2xl shadow-pink-200/40 backdrop-blur-xl dark:border-pink-500/20 dark:bg-slate-900/92 dark:text-slate-100 dark:shadow-black/50">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-400">
              Catálogo
            </p>
            <h2 className="mt-1 font-display text-3xl text-rose-950 dark:text-pink-50">
              Sugerir Partitura
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-pink-200/80 bg-pink-50 text-sm font-bold text-rose-800 transition hover:bg-pink-100 dark:border-pink-500/25 dark:bg-slate-800 dark:text-pink-50"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-rose-900/60 dark:text-pink-100/55">
          Adjunta tu partitura en formato <strong>MusicXML (.xml / .mxl)</strong> o <strong>PDF</strong> para que podamos incluirla en futuras actualizaciones del catálogo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
              Nombre de la obra *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Gurenge / Sadness and Sorrow"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
                Autor / Anime / Obra
              </label>
              <input
                type="text"
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                placeholder="Ej: Kimetsu no Yaiba"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
                Instrumento
              </label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className={fieldClass}
              >
                <option value="Piano">Piano</option>
                <option value="Violin">Violín</option>
                <option value="Flute">Flauta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
              Nivel estimado
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={fieldClass}
            >
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
              Archivo (.musicxml, .xml, .mxl, .pdf) *
            </label>
            <input
              type="file"
              required
              accept=".xml,.musicxml,.mxl,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full rounded-2xl border border-dashed border-pink-300 bg-pink-50/70 px-3 py-3 text-xs text-rose-800 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-pink-400 file:to-rose-400 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-rose-950 dark:border-pink-500/30 dark:bg-slate-950/40 dark:text-pink-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-400">
              Comentarios (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Arreglo en clave de sol y fa..."
              className={fieldClass}
            />
          </div>

          {status === "error" && <p className="text-xs text-rose-600 dark:text-rose-300">{errorMsg}</p>}
          {status === "success" && (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              ¡Solicitud enviada! Revisaremos tu partitura para la próxima actualización.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full px-4 py-2 text-sm text-rose-700 hover:bg-pink-50 dark:text-pink-100 dark:hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === "sending"}
              className="cursor-pointer rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-5 py-2 text-sm font-semibold text-rose-950 shadow-lg shadow-pink-300/40 disabled:opacity-50"
            >
              {status === "sending" ? "Enviando..." : "Enviar Partitura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}