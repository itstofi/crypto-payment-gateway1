import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import tailwindcss from '@tailwindcss/vite'
import { configField } from "vite-config-field";
import path from 'path'

const __dirname = path.resolve();

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react(),
    // tailwindcss(),
  ],
  server: {
    port: 3000,
  },
});
configField({
  plugins: [
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['lucide-react', '@chakra-ui/react-dialog', '@chakra-ui/react-slider'],
        },
      },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})