import { defineConfig } from 'vite';

// base: './' → 產出相對路徑，GitHub Pages 子路徑(/vibejam/)與 itch.io 根目錄皆可用
// outDir: 'docs' → 方便 GitHub Pages「從分支 /docs 部署」
export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
