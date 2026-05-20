import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import obfuscator from "vite-plugin-javascript-obfuscator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['lucide-react', 'sonner'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    mode === "production" && obfuscator({}),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
