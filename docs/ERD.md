# Entity Relationship Diagram (ERD)

## Overview

The Lotus Hieroglyphic SVG Editor uses a client-side state management architecture with Zustand. This document outlines the data structures and relationships within the application.

## Core Entities

### GlyphDef
Represents the definition of a hieroglyphic glyph from the dataset.

```typescript
interface GlyphDef {
  id: string;           // Gardiner sign ID (e.g., "A1", "B2")
  label: string;        // Human-readable name
  category: string;     // Category (People, Animals, etc.)
  keywords?: string[];  // Search keywords
  unicode?: string;     // Unicode representation if available
}
```

### GlyphNode
Represents an instance of a glyph placed on the canvas.

```typescript
interface GlyphNode {
  instanceId: string;   // Unique instance identifier
  glyphId: string;      // Reference to GlyphDef.id
  transform: GlyphTransform;
  position: { x: number; y: number };
  zIndex: number;       // Layer order
  createdAt: Date;
  updatedAt: Date;
}
```

### GlyphTransform
Defines the transformation properties of a glyph instance.

```typescript
interface GlyphTransform {
  rotate: number;       // Rotation in degrees (0-359)
  scale: number;        // Scale factor (0.2-3.0)
  flipX: boolean;       // Horizontal flip
  flipY: boolean;       // Vertical flip
}
```

### EditorState
The main application state managed by Zustand.

```typescript
interface EditorState {
  // Canvas state
  nodes: GlyphNode[];
  selectedIds: Set<string>;
  quadratSize: number;
  zoom: number;
  
  // UI state
  lightboxInstanceId: string | null;
  
  // Actions
  addGlyph: (glyphId: string) => void;
  removeNode: (instanceId: string) => void;
  updateTransform: (instanceId: string, transform: Partial<GlyphTransform>) => void;
  selectNode: (instanceId: string, multi?: boolean) => void;
  // ... other actions
}
```

### GlyphCache
Cached SVG content for performance optimization.

```typescript
interface GlyphCache {
  id: string;
  content: string;      // Raw SVG content
  width: number;
  height: number;
  viewBox?: string;
  loadedAt: Date;
  accessCount: number;
}
```

## Data Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GlyphDef      │    │   GlyphNode     │    │  GlyphCache     │
│   (Static)      │    │   (Dynamic)     │    │  (Runtime)      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • id            │───▶│ • instanceId    │    │ • id            │
│ • label         │    │ • glyphId       │◀───│ • content       │
│ • category      │    │ • transform     │    │ • dimensions    │
│ • keywords      │    │ • position      │    │ • viewBox       │
└─────────────────┘    │ • zIndex        │    │ • metadata      │
                       └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  EditorState    │
                       │  (Zustand)      │
                       ├─────────────────┤
                       │ • nodes[]       │
                       │ • selectedIds   │
                       │ • zoom          │
                       │ • quadratSize   │
                       └─────────────────┘
```

## Relationships

### One-to-Many Relationships

1. **GlyphDef → GlyphNode**
   - One glyph definition can have multiple instances on the canvas
   - Relationship: `GlyphDef.id` ← `GlyphNode.glyphId`

2. **GlyphNode → GlyphTransform**
   - Each glyph node has exactly one transform configuration
   - Relationship: Embedded object

### Caching Relationships

1. **GlyphDef → GlyphCache**
   - SVG content is cached for performance
   - Relationship: `GlyphDef.id` ← `GlyphCache.id`

## State Management Flow

```
User Action → Component → Zustand Store → State Update → UI Re-render
     │              │           │              │             │
     │              │           │              │             ▼
     │              │           │              │      ┌─────────────┐
     │              │           │              │      │ Canvas      │
     │              │           │              │      │ Properties  │
     │              │           │              │      │ Palette     │
     │              │           │              │      └─────────────┘
     │              │           │              │
     │              │           │              ▼
     │              │           │      ┌─────────────────┐
     │              │           │      │ Persistence     │
     │              │           │      │ • LocalStorage  │
     │              │           │      │ • Session       │
     │              │           │      └─────────────────┘
     │              │           │
     │              │           ▼
     │              │   ┌─────────────────┐
     │              │   │ Side Effects    │
     │              │   │ • SVG Loading   │
     │              │   │ • Cache Update  │
     │              │   │ • Performance   │
     │              │   └─────────────────┘
     │              │
     │              ▼
     │      ┌─────────────────┐
     │      │ Event Handlers  │
     │      │ • onClick       │
     │      │ • onTransform   │
     │      │ • onSelect      │
     │      └─────────────────┘
     │
     ▼
┌─────────────────┐
│ User Interface  │
│ • Toolbar       │
│ • Canvas        │
│ • Properties    │
│ • Palette       │
└─────────────────┘
```

## Data Persistence

The application uses browser-based storage for state persistence:

- **Session Storage**: Temporary canvas state
- **Local Storage**: User preferences and cache
- **IndexedDB**: Large SVG cache data (future enhancement)

## Performance Considerations

1. **Lazy Loading**: Glyph SVGs are loaded on-demand
2. **LRU Cache**: Least recently used glyphs are evicted from cache
3. **Batch Operations**: Multiple state updates are batched for performance
4. **Memoization**: Expensive calculations are memoized in React components