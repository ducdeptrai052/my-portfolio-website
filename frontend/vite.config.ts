import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Tiptap editor — admin only
          if (id.includes("@tiptap") || id.includes("prosemirror")) {
            return "vendor-editor";
          }
          // Syntax highlighting — blog detail + admin editor only
          if (
            id.includes("highlight.js") ||
            id.includes("lowlight") ||
            id.includes("rehype-highlight")
          ) {
            return "vendor-highlight";
          }
          // Markdown rendering — blog detail only
          if (
            id.includes("react-markdown") ||
            id.includes("remark-gfm") ||
            id.includes("rehype-") ||
            id.includes("unified") ||
            id.includes("mdast") ||
            id.includes("hast") ||
            id.includes("micromark")
          ) {
            return "vendor-markdown";
          }
          // Charts — admin dashboard only
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }
          // Radix UI primitives
          if (id.includes("@radix-ui")) {
            return "vendor-radix";
          }
          // Core React + router
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("@remix-run")
          ) {
            return "vendor-react";
          }
        },
      },
    },
  },
}));
