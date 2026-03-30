# 𓂀 Lotus — Hieroglyphic SVG Editor

**Developed by [Dark Pyramid](https://darkpyramid.net)**

A production-quality, web-based hieroglyphic SVG editor built with React + TypeScript. This advanced editor provides comprehensive tools for creating, editing, and managing hieroglyphic compositions with professional-grade features and cutting-edge technology.

  ## About Dark Pyramid

  [Dark Pyramid](https://darkpyramid.net) is a tech company building AI and immersive solutions that transform how people interact with technology. We create advanced technologies designed to make the digital world smarter, faster, and more human-centered.

  At Dark Pyramid, we combine AI, engineering, and creative innovation to build solutions that adapt, scale, and deliver real impact. Our work spans intelligent systems, immersive experiences, and next-generation digital products tailored for organizations shaping the future.

  ### Our Services
  - **AI Solutions**: Smart decision-making systems, task automation, and business optimization
  - **Digital Transformation**: Helping companies modernize and leverage technology for growth
  - **Software Development**: Custom software and applications tailored to business needs
  - **Data Analytics**: Converting data into actionable insights with intuitive dashboards
  - **AR & VR Experiences**: Interactive applications for learning, training, and engagement
  - **IoT & Smart Systems**: Connected devices and intelligent systems for enhanced efficiency

  ### Awards & Recognition
  - 🏆 **Huawei Developers Competition** – 1st Place (Egypt 2024)
  - 🏆 **ICOM Award** – Best Digital Museum App (2024–2025)
  - 🏆 **International Academic Recognition** – EU Collaborations

  ## Features

  - 🎨 **Complete hieroglyphic library** — Comprehensive collection across 10 categories (People, Body, Animals, Birds, Plants, Nature, Buildings, Symbols, Regalia, Objects)
  - 🖱️ **Intuitive click-to-add** — Seamless glyph placement from palette to canvas
  - 🔄 **Advanced per-glyph transforms** — Precise rotation (free + preset angles), scaling, and horizontal/vertical flipping
  - 📋 **Professional clipboard integration** — Export as Small/Large/1:1 SVG maintaining vector quality in Word/Google Docs
  - ⌨️ **Comprehensive keyboard shortcuts** — Ctrl+C copy, Ctrl+V paste, Delete to remove, and more
  - 🔍 **Smart search & filtering** — Advanced category-based filtering and text search in glyph palette
  - 🌿 **Authentic Lotus theme** — Carefully crafted papyrus tones, gold accents, and smooth animations
  - ⚡ **Enterprise-grade performance** — Optimized SVG loading with batch processing, intelligent caching, and preloading
  - 🎯 **Professional lightbox viewer** — Full-screen glyph inspection with detailed properties
  - 🎨 **Advanced canvas controls** — Multi-selection, zoom controls, and precise positioning tools

  ## Performance Optimizations

  ### Initial Load Speed
  - **Lazy Loading**: Components load on-demand, reducing initial bundle size by 38%
  - **Code Splitting**: Vendor libraries (132kB) and UI components split into separate chunks
  - **Priority Glyph Preloading**: Most common hieroglyphs (A1, G17, N35, etc.) load first
  - **Critical CSS Inlined**: Instant visual feedback with loading screen
  - **Resource Hints**: Preconnect and modulepreload for faster resource fetching

  ### SVG Loading Performance
  - **Batch Loading**: Groups 15 SVG requests into parallel batches instead of individual requests
  - **Intelligent Caching**: LRU cache with 100-glyph memory limit and 30% aggressive cleanup
  - **Timeout Handling**: 3-second timeout prevents hanging requests
  - **Force Cache**: Aggressive browser caching with `cache: 'force-cache'`
  - **Progressive Loading**: Critical glyphs load first, others on-demand

  ### PWA & Caching Strategy
  - **Selective Precaching**: Only 19 essential files instead of 6,947 SVGs
  - **Runtime Caching**: SVG glyphs cached on-demand with 1-week expiration
  - **Service Worker Optimization**: Reduced initial cache from 456kB to on-demand loading

  ### Bundle Optimization
  - **Removed Unused Dependencies**: Eliminated React Query (-2 packages)
  - **Tree Shaking**: Dead code elimination with Terser minification
  - **Font Loading**: Non-blocking font loading with `media="print" onload="this.media='all'"`
  - **Console Removal**: Production builds strip console.log statements

  ### Real-time Monitoring
  - **Performance Stats**: Live cache hit rate, load times, and request metrics
  - **Visual Indicators**: Cache efficiency display in glyph palette
  - **Memory Management**: Automatic cache eviction prevents memory bloat

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
  ├── data/glyphs.ts           # 79-glyph SVG dataset
  ├── store/editorStore.ts     # Zustand state (nodes, selection, zoom)
  ├── services/
  │   ├── svgBuilder.ts        # Build exportable SVG strings
  │   ├── clipboardService.ts  # Copy/paste with text/html + text/plain
  │   ├── glyphLoader.ts       # Legacy single-request SVG loader
  │   ├── optimizedGlyphLoader.ts # High-performance batch SVG loader
  │   └── performanceMonitor.ts   # Performance metrics tracking
  └── components/
      ├── GlyphPalette.tsx     # Searchable, categorised glyph panel
      ├── EditorCanvas.tsx     # SVG composition canvas
      ├── Toolbar.tsx          # Transform, clipboard, zoom controls
      ├── PropertiesPanel.tsx  # Per-glyph property editor
      └── PerformanceStats.tsx # Real-time performance monitoring
  ```

  ## Performance Metrics

  ### Bundle Size (Production)
  - **Main App**: 155.59 kB (48.02 kB gzipped) - 38% reduction from original
  - **Vendor Chunk**: 132.60 kB (42.84 kB gzipped) - React, React-DOM
  - **UI Components**: 27.23 kB (8.84 kB gzipped) - Radix UI components
  - **Total Initial Load**: ~60 kB gzipped (down from ~124 kB)

  ### Loading Performance
  - **First Contentful Paint**: <1s with critical CSS inlined
  - **Time to Interactive**: <2s with lazy loading
  - **SVG Cache Hit Rate**: 80%+ after initial load
  - **Average SVG Load Time**: <50ms with batching

  ## Getting Started

  ### Quick Start

  ```bash
  # Clone the repository
  git clone https://github.com/darkpyramid/lotus-editor.git
  cd lotus-editor

  # Install dependencies
  npm install

  # Start development server
  npm run dev
  ```

  Open [http://localhost:5173](http://localhost:5173) to view the application.

  ### Docker Development

  ```bash
  # Development with Docker
  npm run docker:dev

  # Production build
  npm run docker:build
  npm run docker:run
  ```

  ### Documentation

  Comprehensive documentation is available in the `docs/` folder:

  - **[Project Setup](docs/PROJECT_SETUP.md)** - Complete development environment setup
  - **[Features](docs/FEATURES.md)** - Detailed feature documentation
  - **[Technologies](docs/TECHNOLOGIES.md)** - Technology stack and architecture
  - **[Deployment](docs/DEPLOYMENT.md)** - Production deployment guide
  - **[Contributing](docs/CONTRIBUTING.md)** - Contribution guidelines
  - **[Use Cases](docs/USE_CASES.md)** - Real-world usage examples
  - **[Structure](docs/STRUCTURE.md)** - Project organization and architecture
  - **[Styles](docs/STYLES.md)** - Design system and styling guide
  - **[Security](docs/SECURITY.md)** - Security policies and procedures
  - **[Contributors](docs/CONTRIBUTORS.md)** - Project team and acknowledgments
  - **[Changelog](docs/CHANGELOG.md)** - Version history and updates
  - **[Code of Conduct](docs/CODE_OF_CONDUCT.md)** - Community guidelines

  ## Contact & Support

  **Dark Pyramid**
  - Website: [https://darkpyramid.net](https://darkpyramid.net)
  - Specializing in AI solutions, digital transformation, and immersive technologies
  - Award-winning technology company with international recognition

  ## License

  © 2024 Dark Pyramid. All rights reserved.
  
  This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
  