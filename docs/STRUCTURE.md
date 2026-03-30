# Project Structure Documentation

## Overview

This document provides a comprehensive overview of the Lotus Hieroglyphic SVG Editor project structure, explaining the organization of files, directories, and architectural decisions.

## Root Directory Structure

```
lotus-editor/
├── .github/                 # GitHub workflows and templates
├── .vscode/                 # VS Code configuration
├── dist/                    # Production build output
├── docs/                    # Project documentation
├── node_modules/            # NPM dependencies
├── public/                  # Static assets
├── src/                     # Source code
├── .gitignore              # Git ignore rules
├── components.json         # Shadcn/ui configuration
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── index.html              # HTML entry point
├── nginx.conf              # Nginx configuration
├── package.json            # NPM package configuration
├── package-lock.json       # NPM lock file
├── README.md               # Project overview
├── tsconfig.json           # TypeScript configuration
├── tsconfig.base.json      # Base TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## Source Code Structure (`src/`)

### Core Application Files

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
├── index.css              # Global styles and Tailwind imports
└── vite-env.d.ts          # Vite environment type definitions
```

### Component Architecture (`src/components/`)

```
src/components/
├── AppShellLoader.tsx      # Application loading shell
├── EditorCanvas.tsx        # Main SVG editing canvas
├── GlyphLightbox.tsx      # Full-screen glyph viewer
├── GlyphPalette.tsx       # Glyph selection palette
├── PerformanceStats.tsx   # Performance monitoring display
├── PropertiesPanel.tsx    # Glyph properties editor
├── Toolbar.tsx            # Main application toolbar
└── ui/                    # Reusable UI components
    ├── badge.tsx          # Badge component
    ├── button.tsx         # Button component
    ├── card.tsx           # Card component
    ├── dropdown-menu.tsx  # Dropdown menu component
    ├── input.tsx          # Input component
    ├── label.tsx          # Label component
    ├── scroll-area.tsx    # Scroll area component
    ├── separator.tsx      # Separator component
    ├── sheet.tsx          # Sheet/drawer component
    ├── slider.tsx         # Slider component
    ├── sonner.tsx         # Toast notification component
    ├── tabs.tsx           # Tabs component
    ├── toggle-group.tsx   # Toggle group component
    ├── toggle.tsx         # Toggle component
    └── tooltip.tsx        # Tooltip component
```

### Data Layer (`src/data/`)

```
src/data/
└── glyphs.ts              # Glyph definitions and metadata
```

### Business Logic (`src/services/`)

```
src/services/
├── clipboardService.ts         # Clipboard operations
├── glyphLoader.ts             # Legacy SVG loading service
├── optimizedGlyphLoader.ts    # High-performance SVG loader
├── performanceMonitor.ts      # Performance tracking
└── svgBuilder.ts              # SVG composition and export
```

### State Management (`src/store/`)

```
src/store/
└── editorStore.ts         # Zustand state management
```

### Type Definitions (`src/types/`)

```
src/types/
└── editor.ts              # TypeScript type definitions
```

### Utility Functions (`src/lib/`)

```
src/lib/
├── svg-utils.ts           # SVG manipulation utilities
└── utils.ts               # General utility functions
```

## Public Assets (`public/`)

```
public/
├── icon-192.png           # PWA icon (192x192)
├── icon-512.png           # PWA icon (512x512)
└── jseshGlyphs/           # SVG glyph collection (6,940 files)
    ├── A1.svg             # Human figure glyphs
    ├── B1.svg             # Body part glyphs
    ├── C1.svg             # Animal glyphs
    ├── D1.svg             # Bird glyphs
    ├── E1.svg             # Plant glyphs
    ├── F1.svg             # Nature glyphs
    ├── G1.svg             # Building glyphs
    ├── H1.svg             # Symbol glyphs
    ├── I1.svg             # Regalia glyphs
    └── ...                # 6,940 total SVG files
```

## Documentation (`docs/`)

```
docs/
├── CHANGELOG.md           # Version history and changes
├── CODE_OF_CONDUCT.md     # Community guidelines
├── CONTRIBUTING.md        # Contribution guidelines
├── CONTRIBUTORS.md        # Project contributors
├── DEPLOYMENT.md          # Deployment instructions
├── ERD.md                 # Entity relationship diagram
├── FEATURES.md            # Feature documentation
├── PROJECT_SETUP.md       # Development setup guide
├── SECURITY.md            # Security policies
├── STRUCTURE.md           # This file
├── STYLES.md              # Design system documentation
├── TECHNOLOGIES.md        # Technology stack details
└── USE_CASES.md           # Usage examples and scenarios
```

## Configuration Files

### Build Configuration

**vite.config.ts**
- Vite build configuration
- Plugin setup (React, TypeScript)
- Build optimization settings
- Development server configuration

**tsconfig.json**
- TypeScript compiler options
- Path mapping configuration
- Strict type checking rules
- Module resolution settings

**components.json**
- Shadcn/ui component configuration
- Tailwind CSS integration
- Component generation settings

### Package Management

**package.json**
- Project metadata and dependencies
- Build and development scripts
- NPM package configuration
- Version management

**package-lock.json**
- Exact dependency versions
- Dependency tree lock
- Security and reproducibility

### Docker Configuration

**Dockerfile**
- Multi-stage production build
- Nginx web server setup
- Security optimizations
- Health check configuration

**Dockerfile.dev**
- Development environment setup
- Hot reload configuration
- Volume mounting for development

**docker-compose.yml**
- Service orchestration
- Environment configuration
- Network and volume setup

### Web Server Configuration

**nginx.conf**
- Static file serving
- Gzip compression
- Security headers
- SPA routing support

## Architectural Patterns

### Component Architecture

**Atomic Design Principles**
- **Atoms**: Basic UI components (`src/components/ui/`)
- **Molecules**: Composed components (buttons with icons)
- **Organisms**: Complex components (`GlyphPalette`, `EditorCanvas`)
- **Templates**: Layout components (`App.tsx`)
- **Pages**: Complete views (single-page application)

**Component Responsibilities**
- **Presentation Components**: Pure UI rendering
- **Container Components**: State management and business logic
- **Service Components**: External integrations and side effects
- **Utility Components**: Reusable helper functions

### State Management Architecture

**Zustand Store Structure**
```typescript
interface EditorState {
  // Canvas state
  nodes: GlyphNode[]
  selectedNodeIds: string[]
  zoom: number
  
  // UI state
  isLightboxOpen: boolean
  lightboxGlyph: GlyphDef | null
  
  // Actions
  addNode: (glyph: GlyphDef) => void
  updateNode: (id: string, updates: Partial<GlyphNode>) => void
  deleteNodes: (ids: string[]) => void
  // ... more actions
}
```

**State Organization**
- **Domain State**: Editor-specific data (nodes, selection)
- **UI State**: Interface state (modals, panels)
- **Derived State**: Computed values (selected nodes, canvas bounds)
- **Actions**: State mutations and side effects

### Service Layer Architecture

**Service Responsibilities**
- **Data Services**: External data fetching and caching
- **Business Services**: Domain logic and operations
- **Infrastructure Services**: System integrations and utilities
- **Presentation Services**: UI-specific operations

**Service Patterns**
- **Singleton Pattern**: Single instance services (performance monitor)
- **Factory Pattern**: Dynamic service creation (glyph loaders)
- **Observer Pattern**: Event-driven updates (performance stats)
- **Strategy Pattern**: Interchangeable algorithms (loading strategies)

## File Naming Conventions

### Component Files
- **PascalCase**: `EditorCanvas.tsx`, `GlyphPalette.tsx`
- **Descriptive Names**: Clear purpose indication
- **Single Responsibility**: One main component per file
- **Co-location**: Related files grouped together

### Service Files
- **camelCase**: `clipboardService.ts`, `glyphLoader.ts`
- **Service Suffix**: Clear service identification
- **Functional Names**: Action-oriented naming
- **Interface Segregation**: Focused service responsibilities

### Type Files
- **camelCase**: `editor.ts`, `glyph.ts`
- **Domain Grouping**: Related types together
- **Export Organization**: Logical export structure
- **Documentation**: Comprehensive type documentation

### Utility Files
- **kebab-case**: `svg-utils.ts`, `string-utils.ts`
- **Functional Grouping**: Related utilities together
- **Pure Functions**: Side-effect-free utilities
- **Tree Shaking**: Optimized for dead code elimination

## Import/Export Patterns

### Import Organization
```typescript
// 1. External libraries
import React from 'react'
import { create } from 'zustand'

// 2. Internal services
import { glyphLoader } from '@/services/glyphLoader'

// 3. Internal components
import { Button } from '@/components/ui/button'

// 4. Types
import type { GlyphDef } from '@/types/editor'

// 5. Relative imports
import './Component.css'
```

### Export Patterns
```typescript
// Named exports (preferred)
export const ComponentName = () => { ... }
export { utilityFunction }

// Default exports (for main components)
export default ComponentName

// Re-exports (for index files)
export { ComponentA } from './ComponentA'
export { ComponentB } from './ComponentB'
```

## Performance Considerations

### Bundle Organization
- **Code Splitting**: Lazy loading for non-critical components
- **Tree Shaking**: Dead code elimination
- **Chunk Optimization**: Vendor and app code separation
- **Asset Optimization**: Image and font optimization

### Memory Management
- **Component Cleanup**: Proper useEffect cleanup
- **Event Listener Management**: Add/remove event listeners
- **Cache Management**: LRU cache with size limits
- **Memory Leak Prevention**: Weak references where appropriate

### Loading Strategies
- **Critical Path**: Essential resources loaded first
- **Progressive Loading**: Non-critical resources loaded on-demand
- **Preloading**: Anticipated resources loaded in background
- **Caching**: Aggressive caching for static resources

## Development Workflow

### File Creation Guidelines
1. **Identify Purpose**: Determine file responsibility
2. **Choose Location**: Follow directory structure
3. **Name Appropriately**: Use naming conventions
4. **Add Types**: Include TypeScript definitions
5. **Document**: Add JSDoc comments
6. **Test**: Include test coverage

### Modification Guidelines
1. **Understand Impact**: Analyze dependencies
2. **Maintain Contracts**: Preserve public interfaces
3. **Update Tests**: Modify related tests
4. **Update Documentation**: Keep docs current
5. **Performance Check**: Monitor performance impact

### Refactoring Guidelines
1. **Plan Changes**: Design refactoring approach
2. **Incremental Updates**: Small, focused changes
3. **Maintain Functionality**: Preserve existing behavior
4. **Update Dependencies**: Fix import/export changes
5. **Validate Changes**: Comprehensive testing

## Future Structure Considerations

### Scalability Improvements
- **Feature Modules**: Organize by feature domains
- **Micro-frontends**: Potential module federation
- **Plugin Architecture**: Extensible component system
- **API Layer**: Separate backend integration

### Maintenance Enhancements
- **Automated Refactoring**: Code transformation tools
- **Dependency Management**: Automated updates
- **Code Quality**: Enhanced linting and formatting
- **Documentation**: Automated documentation generation

---

For implementation details, see [TECHNOLOGIES.md](TECHNOLOGIES.md).
For development setup, see [PROJECT_SETUP.md](PROJECT_SETUP.md).
For coding standards, see [CONTRIBUTING.md](CONTRIBUTING.md).