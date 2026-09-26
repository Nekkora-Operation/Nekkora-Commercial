import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    // A nekkora-lib vem de ../Nekkora-lib (link local): garante uma única cópia do React.
    dedupe: ['react', 'react-dom'],
  },
});
