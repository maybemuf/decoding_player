import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Relative base + HashRouter = works from any static host path (GitHub Pages, Netlify) without rewrites.
export default defineConfig({
  base: './',
  plugins: [react()],
});
