import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react({
      // Enable React Fast Refresh optimizations
      fastRefresh: true,
    }),
    tailwindcss(),
    VitePWA({
      registerType: "prompt", // Changed from autoUpdate to reduce initial load
      includeAssets: ["icon-192.png", "icon-512.png"],
      // Removed jseshGlyphs from PWA precaching to reduce initial load time
      workbox: {
        // Only cache essential files initially
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        globIgnores: ["**/jseshGlyphs/**"], // Don't precache all SVGs
        maximumFileSizeToCacheInBytes: 3000000, // 3MB limit
        runtimeCaching: [
          {
            // Cache SVG glyphs on demand
            urlPattern: /\/jseshGlyphs\/.*\.svg$/,
            handler: "CacheFirst",
            options: {
              cacheName: "glyph-cache",
              expiration: {
                maxEntries: 100, // Limit cached glyphs
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
    // Optimize build for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          vendor: ["react", "react-dom"],
          ui: ["lucide-react"],
        },
      },
    },
    // Enable minification and compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "zustand", "lucide-react"],
    exclude: ["@tanstack/react-query"], // Removed since we're not using it anymore
  },
});


