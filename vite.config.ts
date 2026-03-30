import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt", // Changed from autoUpdate to reduce initial load
      includeAssets: ["icon-192.png", "icon-512.png"],
      // Minimal PWA for faster initial load
      workbox: {
        // Only cache essential files initially
        globPatterns: ["**/*.{js,css,html,ico,png}"],
        globIgnores: ["**/jseshGlyphs/**"], // Don't precache all SVGs
        maximumFileSizeToCacheInBytes: 2000000, // 2MB limit
        runtimeCaching: [
          {
            // Cache SVG glyphs on demand
            urlPattern: /\/jseshGlyphs\/.*\.svg$/,
            handler: "CacheFirst",
            options: {
              cacheName: "glyph-cache",
              expiration: {
                maxEntries: 50, // Reduced from 100
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
              },
            },
          },
        ],
      },
      manifest: {
        name: "Lotus | Hieroglyphic Editor",
        short_name: "Lotus",
        description: "Professional Hieroglyphic SVG Editor for Archaeology Students",
        display: "standalone",
        theme_color: "#f4ece1",
        background_color: "#f4ece1",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Disable sourcemaps to fix UI component errors
    sourcemap: false,
    // Aggressive optimization for faster loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Simple chunking to avoid circular dependencies
          'react-libs': ['react', 'react-dom'],
          'ui-libs': ['lucide-react'],
        },
      },
    },
    // Enable minification and compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
    },
    // Optimize chunk size for faster loading
    chunkSizeWarningLimit: 500, // Reduced from 1000
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      ignored: ['**/public/jseshGlyphs/**'],
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Optimize dependencies for faster dev startup
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "lucide-react"],
  },
});


