"use client";

import { useState } from "react";
import { Heart, X, ExternalLink, Globe, CreditCard, Coffee } from "lucide-react";
import { SUPPORT_LINKS } from "@/lib/links";

interface SupportButtonProps {
  variant?: "sidebar" | "landing";
}

export default function SupportButton({ variant = "sidebar" }: SupportButtonProps) {
  const [open, setOpen] = useState(false);

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <>
      {variant === "landing" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-pink-200/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-rose-950 transition hover:-translate-y-0.5 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
        >
          <Coffee className="h-4 w-4" strokeWidth={1.75} />
          Apoyar Proyecto
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ml-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-pink-200/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-rose-950 transition hover:-translate-y-0.5 dark:border-pink-500/20 dark:bg-slate-950/40 dark:text-pink-50"
        >
          <Coffee className="h-4 w-4" strokeWidth={1.75} />
          Apoyar Proyecto
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-pink-200/80 bg-[#FFF8FA] p-6 shadow-2xl dark:border-pink-500/20 dark:bg-[#121629]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-rose-950 dark:text-pink-50">
                  Apoyar SheetMusic
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Elige la plataforma más cómoda según tu ubicación para contribuir al desarrollo gratuito de la app.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-slate-500 transition hover:bg-pink-100/70 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => openExternal(SUPPORT_LINKS.mercadopago)}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-sky-200/80 bg-sky-50/70 p-4 text-left transition hover:bg-sky-100/70 dark:border-sky-500/20 dark:bg-sky-950/30 dark:hover:bg-sky-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Aporte Nacional (Chile)
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Mercado Pago · CuentaRUT, débito y crédito (CLP)
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => openExternal(SUPPORT_LINKS.kofi)}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-pink-200/80 bg-pink-50/70 p-4 text-left transition hover:bg-pink-100/70 dark:border-pink-500/20 dark:bg-pink-950/30 dark:hover:bg-pink-900/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Aporte Internacional
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Ko-fi · PayPal, Mastercard y Visa (USD)
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}