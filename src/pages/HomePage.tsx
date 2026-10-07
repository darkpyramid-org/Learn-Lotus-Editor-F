import { Link } from "wouter";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ArrowRight, Feather, Layers, LayoutPanelLeft, Sparkles, ZoomIn } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Curated Glyph Library",
    body: "Browse hundreds of JSesh hieroglyphs organized by Gardiner category, with fast search and category filters.",
  },
  {
    icon: Sparkles,
    title: "Per-Glyph Transforms",
    body: "Rotate, scale, and flip individual signs. Everything you arrange is preserved when you export or paste it back.",
  },
  {
    icon: LayoutPanelLeft,
    title: "Vector Clipboard",
    body: "Copy compositions as resolution-independent SVG at Small, Large, or 1:1 scale — ready for Word, Docs, or PowerPoint.",
  },
  {
    icon: Feather,
    title: "Keyboard First",
    body: "Ctrl/Cmd+C to copy, Ctrl/Cmd+V to paste, Delete to remove, Esc to deselect. The editor stays out of your way.",
  },
  {
    icon: ZoomIn,
    title: "Designed for the Modern Web",
    body: "Lazy-loaded components, batched glyph caching, and a service worker that keeps the editor available offline.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fdfaf5] text-foreground flex flex-col">
      {/* Nav */}
      <header className="h-16 px-6 md:px-10 flex items-center justify-between border-b border-amber-900/10 bg-white/60 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-amber-600 flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-black text-lg text-white">𓂀</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">Lotus</span>
            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Hieroglyphic Editor</span>
          </div>
        </div>
        <nav className="flex items-center gap-3">
          <LanguageToggle />
          <Link href="/editor" className="inline-flex items-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 shadow transition-colors">
            <span>Open Editor</span> <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="text-6xl md:text-7xl mb-8 animate-lotus-float text-amber-700 select-none" aria-hidden>
            𓆸
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-black tracking-tight text-amber-950">
            Compose Hieroglyphs,
            <span className="text-amber-600"> Export Vectors</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-amber-900/60 max-w-2xl mx-auto leading-relaxed">
            Lotus is a professional, browser-based SVG editor for ancient Egyptian hieroglyphs.
            Arrange signs in quadrats, transform them, and copy crisp vector artwork anywhere.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/editor" className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-black uppercase tracking-widest px-8 py-4 shadow-lg shadow-amber-600/20 transition-all hover:-translate-y-0.5">
              Start Creating <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/darkpyramid-org/Learn-Lotus-Editor-F"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-900/15 bg-white/70 hover:bg-white text-amber-900 text-sm font-bold uppercase tracking-widest px-8 py-4 transition-colors"
            >
              View on GitHub
            </a>
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-4xl text-amber-800/30 select-none tracking-widest" aria-hidden>
            𓂀 𓆸 𓅓 𓏏 𓋴
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 pb-24">
          <h2 className="text-center text-[11px] font-black uppercase tracking-[0.3em] text-amber-700/70 mb-12">
            Crafted for Researchers & Students
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-amber-900/10 bg-white/70 hover:bg-white hover:shadow-lg hover:shadow-amber-900/5 transition-all p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-600/10 text-amber-700 flex items-center justify-center mb-4">
                  <Icon size={18} />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-amber-950">{title}</h3>
                <p className="mt-2 text-sm text-amber-900/60 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-amber-900/10 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-amber-900/40">
        Lotus — developed by Dark Pyramid
      </footer>
    </div>
  );
}