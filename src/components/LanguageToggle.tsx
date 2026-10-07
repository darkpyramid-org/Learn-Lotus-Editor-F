import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Lang = "en" | "ar";

function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  try {
    localStorage.setItem("lotus-lang", lang);
  } catch {
    /* storage unavailable */
  }
}

function readStoredLang(): Lang {
  try {
    return localStorage.getItem("lotus-lang") === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

/** EN / AR switcher. Sets <html lang/dir>; CSS swaps the font (Cairo for Arabic). */
export function LanguageToggle({ className }: { className?: string }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);

  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  return (
    <div className={cn("inline-flex items-center gap-1", className)} role="group" aria-label="Language">
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-lg border border-amber-500/30 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest transition-colors",
            lang === l
              ? "bg-amber-600 text-white border-amber-600"
              : "text-amber-700/70 hover:border-amber-500/60 hover:text-amber-900"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
