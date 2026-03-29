# 𓂀 Lotus — Hieroglyphic SVG Editor

  A production-quality, web-based hieroglyphic SVG editor built with React + TypeScript.

  ## Features

  - 🎨 **all have hieroglyphic glyphs** across 10 categories (People, Body, Animals, Birds, Plants, Nature, Buildings, Symbols, Regalia, Objects)
  - 🖱️ **Click-to-add** glyphs from the palette to your canvas composition
  - 🔄 **Per-glyph transforms** — rotate (free + preset), scale, flip H/V
  - 📋 **Clipboard** — copy as Small / Large / 1:1 SVG that stays vector in Word/Google Docs
  - ⌨️ **Keyboard shortcuts** — Ctrl+C copy, Ctrl+V paste, Delete to remove
  - 🔍 **Search & filter** by category in the glyph palette
  - 🌿 **Lotus theme** — warm papyrus tones, gold accents, smooth animations

  ## Tech Stack

  - React 19 + TypeScript
  - Vite
  - Zustand (state management)
  - TailwindCSS v4
  - SVG-first rendering (no canvas, no rasterization)

  ## Architecture

  ```
  src/
  ├── types/editor.ts          # GlyphDef, GlyphNode, GlyphTransform
  ├── data/glyphs.ts           # 30-glyph SVG dataset
  ├── store/editorStore.ts     # Zustand state (nodes, selection, zoom)
  ├── services/
  │   ├── svgBuilder.ts        # Build exportable SVG strings
  │   └── clipboardService.ts  # Copy/paste with text/html + text/plain
  └── components/
      ├── GlyphPalette.tsx     # Searchable, categorised glyph panel
      ├── EditorCanvas.tsx     # SVG composition canvas
      ├── Toolbar.tsx          # Transform, clipboard, zoom controls
      └── PropertiesPanel.tsx  # Per-glyph property editor
  ```

  ## Getting Started

  ```bash
  pnpm install
  pnpm --filter @workspace/lotus-editor run dev
  ```
  