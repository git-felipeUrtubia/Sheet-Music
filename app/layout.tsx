import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import AppShell from "@/components/shell/AppShell";
import "./global.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SheetMusic",
  description: "Estudio musical para leer, escuchar y practicar partituras.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FFF8FA] text-slate-800 antialiased dark:bg-[#0B0D17] dark:text-slate-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("sheetmusic-theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`,
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
