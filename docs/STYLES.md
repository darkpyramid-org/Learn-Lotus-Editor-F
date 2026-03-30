# Design System & Styles Documentation

## Overview

The Lotus Hieroglyphic SVG Editor uses a carefully crafted design system inspired by ancient Egyptian aesthetics while maintaining modern usability standards. This document outlines the complete design system, including colors, typography, spacing, components, and styling guidelines.

## Design Philosophy

### Core Principles

**Authenticity with Modernity**
- Inspired by ancient Egyptian papyrus and hieroglyphic aesthetics
- Modern interface patterns for intuitive user experience
- Balance between historical authenticity and contemporary usability

**Accessibility First**
- WCAG 2.1 AA compliance
- High contrast ratios for all text
- Keyboard navigation support
- Screen reader compatibility

**Performance Optimized**
- Minimal CSS bundle size
- Efficient Tailwind CSS utility classes
- Optimized animations and transitions
- Responsive design patterns

## Color System

### Primary Palette

**Lotus Theme Colors**
```css
/* Papyrus Tones */
--papyrus-50: #fdfaf5    /* Lightest papyrus */
--papyrus-100: #f4ece1   /* Light papyrus background */
--papyrus-200: #e8d5c4   /* Medium papyrus */
--papyrus-300: #d4b896   /* Darker papyrus */
--papyrus-400: #c19a68   /* Deep papyrus */

/* Golden Accents */
--gold-50: #fefce8       /* Light gold tint */
--gold-100: #fef3c7      /* Soft gold */
--gold-200: #fde68a      /* Medium gold */
--gold-300: #fcd34d      /* Rich gold */
--gold-400: #d4af37      /* Primary gold */
--gold-500: #b8860b      /* Deep gold */
--gold-600: #92691d      /* Dark gold */

/* Neutral Grays */
--gray-50: #f9fafb       /* Lightest gray */
--gray-100: #f3f4f6      /* Light gray */
--gray-200: #e5e7eb      /* Medium light gray */
--gray-300: #d1d5db      /* Medium gray */
--gray-400: #9ca3af      /* Medium dark gray */
--gray-500: #6b7280      /* Dark gray */
--gray-600: #4b5563      /* Darker gray */
--gray-700: #374151      /* Very dark gray */
--gray-800: #1f2937      /* Almost black */
--gray-900: #111827      /* Darkest gray */
```

### Semantic Colors

**Status Colors**
```css
/* Success */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* Warning */
--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

/* Error */
--error-50: #fef2f2
--error-500: #ef4444
--error-600: #dc2626

/* Info */
--info-50: #eff6ff
--info-500: #3b82f6
--info-600: #2563eb
```

### Color Usage Guidelines

**Background Colors**
- **Primary Background**: `papyrus-50` (#fdfaf5)
- **Secondary Background**: `papyrus-100` (#f4ece1)
- **Card Background**: `white` with subtle shadow
- **Panel Background**: `papyrus-100` (#f4ece1)

**Text Colors**
- **Primary Text**: `gray-900` (#111827)
- **Secondary Text**: `gray-600` (#4b5563)
- **Muted Text**: `gray-500` (#6b7280)
- **Accent Text**: `gold-600` (#92691d)

**Interactive Colors**
- **Primary Button**: `gold-400` (#d4af37)
- **Primary Button Hover**: `gold-500` (#b8860b)
- **Secondary Button**: `gray-200` (#e5e7eb)
- **Link Color**: `gold-600` (#92691d)
- **Focus Ring**: `gold-400` (#d4af37)

## Typography

### Font Stack

**Primary Font Family**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

**Fallback Strategy**
- **Primary**: Inter (Google Fonts)
- **System**: Native system fonts for performance
- **Fallback**: Standard sans-serif fonts

### Type Scale

**Heading Styles**
```css
/* H1 - Page Title */
.text-4xl {
  font-size: 2.25rem;    /* 36px */
  line-height: 2.5rem;   /* 40px */
  font-weight: 700;      /* Bold */
  letter-spacing: -0.025em;
}

/* H2 - Section Title */
.text-3xl {
  font-size: 1.875rem;   /* 30px */
  line-height: 2.25rem;  /* 36px */
  font-weight: 600;      /* Semibold */
  letter-spacing: -0.025em;
}

/* H3 - Subsection Title */
.text-2xl {
  font-size: 1.5rem;     /* 24px */
  line-height: 2rem;     /* 32px */
  font-weight: 600;      /* Semibold */
}

/* H4 - Component Title */
.text-xl {
  font-size: 1.25rem;    /* 20px */
  line-height: 1.75rem;  /* 28px */
  font-weight: 600;      /* Semibold */
}

/* H5 - Small Title */
.text-lg {
  font-size: 1.125rem;   /* 18px */
  line-height: 1.75rem;  /* 28px */
  font-weight: 500;      /* Medium */
}
```

**Body Text Styles**
```css
/* Large Body Text */
.text-base {
  font-size: 1rem;       /* 16px */
  line-height: 1.5rem;   /* 24px */
  font-weight: 400;      /* Normal */
}

/* Small Body Text */
.text-sm {
  font-size: 0.875rem;   /* 14px */
  line-height: 1.25rem;  /* 20px */
  font-weight: 400;      /* Normal */
}

/* Caption Text */
.text-xs {
  font-size: 0.75rem;    /* 12px */
  line-height: 1rem;     /* 16px */
  font-weight: 400;      /* Normal */
}
```

**Special Text Styles**
```css
/* Code Text */
.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.875rem;   /* 14px */
  line-height: 1.25rem;  /* 20px */
}

/* Emphasis */
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.italic { font-style: italic; }
```

### Typography Guidelines

**Hierarchy Rules**
- Use consistent heading levels (H1 → H2 → H3)
- Maintain proper contrast ratios (4.5:1 minimum)
- Limit line length to 45-75 characters
- Use appropriate line height (1.4-1.6 for body text)

**Responsive Typography**
```css
/* Mobile First Approach */
@media (min-width: 640px) {
  .text-4xl { font-size: 3rem; }      /* 48px on larger screens */
  .text-3xl { font-size: 2.25rem; }   /* 36px on larger screens */
}

@media (min-width: 1024px) {
  .text-4xl { font-size: 3.75rem; }   /* 60px on desktop */
  .text-3xl { font-size: 3rem; }      /* 48px on desktop */
}
```

## Spacing System

### Spacing Scale

**Tailwind CSS Spacing Units**
```css
/* Base unit: 0.25rem (4px) */
.space-1  { margin: 0.25rem; }   /* 4px */
.space-2  { margin: 0.5rem; }    /* 8px */
.space-3  { margin: 0.75rem; }   /* 12px */
.space-4  { margin: 1rem; }      /* 16px */
.space-5  { margin: 1.25rem; }   /* 20px */
.space-6  { margin: 1.5rem; }    /* 24px */
.space-8  { margin: 2rem; }      /* 32px */
.space-10 { margin: 2.5rem; }    /* 40px */
.space-12 { margin: 3rem; }      /* 48px */
.space-16 { margin: 4rem; }      /* 64px */
.space-20 { margin: 5rem; }      /* 80px */
.space-24 { margin: 6rem; }      /* 96px */
```

### Layout Spacing

**Component Spacing**
- **Tight Spacing**: 4px-8px (buttons, form elements)
- **Normal Spacing**: 12px-16px (card content, list items)
- **Loose Spacing**: 24px-32px (sections, major components)
- **Section Spacing**: 48px-64px (page sections)

**Grid and Layout**
```css
/* Container Spacing */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid Gaps */
.grid-gap-sm { gap: 0.5rem; }    /* 8px */
.grid-gap-md { gap: 1rem; }      /* 16px */
.grid-gap-lg { gap: 1.5rem; }    /* 24px */
.grid-gap-xl { gap: 2rem; }      /* 32px */
```

## Component Styles

### Button Components

**Primary Button**
```css
.btn-primary {
  @apply bg-gold-400 hover:bg-gold-500 text-white font-medium;
  @apply px-4 py-2 rounded-md transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

**Secondary Button**
```css
.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium;
  @apply px-4 py-2 rounded-md transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

**Icon Button**
```css
.btn-icon {
  @apply p-2 rounded-md transition-colors duration-200;
  @apply hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
```

### Card Components

**Base Card**
```css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
  @apply transition-shadow duration-200 hover:shadow-md;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-content {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-gray-200 bg-gray-50;
}
```

**Glyph Card (Special)**
```css
.glyph-card {
  @apply bg-white rounded-lg border-2 border-transparent;
  @apply transition-all duration-200 cursor-pointer;
  @apply hover:border-gold-300 hover:shadow-md;
  @apply focus:outline-none focus:ring-2 focus:ring-gold-400;
}

.glyph-card.selected {
  @apply border-gold-400 ring-2 ring-gold-400 ring-opacity-50;
}
```

### Form Components

**Input Fields**
```css
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md;
  @apply focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400;
  @apply disabled:bg-gray-100 disabled:cursor-not-allowed;
  @apply placeholder:text-gray-500;
}

.input-error {
  @apply border-red-500 focus:ring-red-500 focus:border-red-500;
}
```

**Labels**
```css
.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.label-required::after {
  content: " *";
  @apply text-red-500;
}
```

### Navigation Components

**Toolbar**
```css
.toolbar {
  @apply bg-papyrus-100 border-b border-gray-200;
  @apply px-4 py-3 flex items-center justify-between;
}

.toolbar-section {
  @apply flex items-center space-x-4;
}
```

**Sidebar**
```css
.sidebar {
  @apply bg-papyrus-100 border-r border-gray-200;
  @apply w-64 h-full overflow-y-auto;
}

.sidebar-header {
  @apply px-4 py-3 border-b border-gray-200;
}

.sidebar-content {
  @apply p-4;
}
```

## Animation System

### Transition Classes

**Standard Transitions**
```css
.transition-colors {
  transition: color 200ms ease-in-out,
              background-color 200ms ease-in-out,
              border-color 200ms ease-in-out;
}

.transition-transform {
  transition: transform 200ms ease-in-out;
}

.transition-opacity {
  transition: opacity 200ms ease-in-out;
}

.transition-all {
  transition: all 200ms ease-in-out;
}
```

**Custom Animations**
```css
/* Fade In Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 300ms ease-in-out;
}

/* Slide In Animation */
@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-slide-in {
  animation: slideIn 300ms ease-out;
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Micro-interactions

**Hover Effects**
```css
.hover-lift {
  @apply transition-transform duration-200;
}

.hover-lift:hover {
  @apply transform -translate-y-1;
}

.hover-glow {
  @apply transition-shadow duration-200;
}

.hover-glow:hover {
  @apply shadow-lg shadow-gold-400/25;
}
```

**Loading States**
```css
.loading-skeleton {
  @apply bg-gray-200 animate-pulse rounded;
}

.loading-spinner {
  @apply animate-spin rounded-full border-2 border-gray-300 border-t-gold-400;
}
```

## Responsive Design

### Breakpoint System

**Tailwind CSS Breakpoints**
```css
/* Mobile First Approach */
/* xs: 0px - 639px (default) */
/* sm: 640px and up */
@media (min-width: 640px) { ... }

/* md: 768px and up */
@media (min-width: 768px) { ... }

/* lg: 1024px and up */
@media (min-width: 1024px) { ... }

/* xl: 1280px and up */
@media (min-width: 1280px) { ... }

/* 2xl: 1536px and up */
@media (min-width: 1536px) { ... }
```

### Layout Patterns

**Three-Column Layout**
```css
.layout-three-column {
  @apply grid grid-cols-1 lg:grid-cols-[260px_1fr_240px] h-screen;
}

.layout-sidebar-left {
  @apply hidden lg:block bg-papyrus-100 border-r border-gray-200;
}

.layout-main {
  @apply flex-1 overflow-hidden;
}

.layout-sidebar-right {
  @apply hidden lg:block bg-papyrus-100 border-l border-gray-200;
}
```

**Mobile Navigation**
```css
.mobile-nav {
  @apply lg:hidden fixed inset-x-0 bottom-0 bg-white border-t border-gray-200;
  @apply flex items-center justify-around py-2;
}

.mobile-nav-item {
  @apply flex flex-col items-center p-2 text-xs;
}
```

## Dark Mode Support (Future)

### Color Scheme Variables

**CSS Custom Properties**
```css
:root {
  --bg-primary: #fdfaf5;
  --bg-secondary: #f4ece1;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent-primary: #d4af37;
}

[data-theme="dark"] {
  --bg-primary: #1f2937;
  --bg-secondary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --accent-primary: #fcd34d;
}
```

**Theme Toggle Implementation**
```css
.theme-toggle {
  @apply p-2 rounded-md transition-colors duration-200;
  @apply hover:bg-gray-100 dark:hover:bg-gray-800;
}

.dark .theme-toggle {
  @apply text-gray-300 hover:text-white;
}
```

## Accessibility Styles

### Focus Management

**Focus Indicators**
```css
.focus-visible {
  @apply outline-none ring-2 ring-gold-400 ring-offset-2;
}

.focus-within {
  @apply ring-2 ring-gold-400 ring-offset-2;
}
```

**Skip Links**
```css
.skip-link {
  @apply absolute -top-10 left-4 bg-gold-400 text-white px-4 py-2 rounded;
  @apply focus:top-4 transition-all duration-200;
}
```

### Screen Reader Support

**Visually Hidden Content**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**High Contrast Mode**
```css
@media (prefers-contrast: high) {
  .btn-primary {
    @apply border-2 border-black;
  }
  
  .card {
    @apply border-2 border-gray-900;
  }
}
```

## Performance Optimizations

### CSS Optimization

**Critical CSS Inlining**
```html
<!-- Critical styles inlined in HTML head -->
<style>
  /* Critical above-the-fold styles */
  .layout-container { display: grid; }
  .loading-screen { /* ... */ }
</style>
```

**Lazy Loading Non-Critical CSS**
```html
<!-- Non-critical CSS loaded asynchronously -->
<link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### Bundle Size Optimization

**Tailwind CSS Purging**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Removes unused CSS classes
}
```

**CSS-in-JS Optimization**
```css
/* Use utility classes instead of custom CSS */
/* ❌ Custom CSS */
.custom-button {
  background-color: #d4af37;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

/* ✅ Utility classes */
.btn { @apply bg-gold-400 px-4 py-2 rounded-md; }
```

## Style Guidelines

### Naming Conventions

**CSS Class Naming**
- Use kebab-case for CSS classes
- Use semantic names over presentational names
- Prefix component-specific classes with component name

**Component Styling**
```css
/* ✅ Good */
.glyph-palette { }
.glyph-palette__header { }
.glyph-palette__item { }
.glyph-palette__item--selected { }

/* ❌ Avoid */
.blue-box { }
.big-text { }
.left-sidebar { }
```

### Code Organization

**File Structure**
```
src/
├── styles/
│   ├── globals.css         # Global styles and Tailwind imports
│   ├── components.css      # Component-specific styles
│   ├── utilities.css       # Custom utility classes
│   └── animations.css      # Animation definitions
```

**Import Order**
```css
/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Custom base styles */
@layer base { }

/* 3. Custom components */
@layer components { }

/* 4. Custom utilities */
@layer utilities { }
```

## Testing Styles

### Visual Regression Testing

**Chromatic Integration**
```javascript
// .storybook/main.js
module.exports = {
  addons: ['@storybook/addon-essentials'],
  // Visual testing configuration
}
```

**Style Linting**
```json
// stylelint.config.js
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "declaration-block-trailing-semicolon": "always"
  }
}
```

### Accessibility Testing

**Color Contrast Validation**
```javascript
// Test color contrast ratios
const contrastRatio = getContrastRatio('#d4af37', '#ffffff')
expect(contrastRatio).toBeGreaterThan(4.5) // WCAG AA standard
```

**Focus Testing**
```javascript
// Test focus management
const button = screen.getByRole('button')
button.focus()
expect(button).toHaveFocus()
expect(button).toHaveClass('focus-visible')
```

---

For implementation details, see [TECHNOLOGIES.md](TECHNOLOGIES.md).
For component usage, see [STRUCTURE.md](STRUCTURE.md).
For accessibility guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).