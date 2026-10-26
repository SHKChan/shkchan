import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.vibe-game.com',
  // Served by the Worker route www.vibe-game.com/blog*
  base: '/blog',
  // Nest output so asset paths match request paths (/blog/...) under wrangler's ./dist
  outDir: './dist/blog',
  output: 'static',
  build: {
    format: 'file'
  }
});
