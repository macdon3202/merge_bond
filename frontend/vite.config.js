import { defineConfig } from 'vite';

export default defineConfig({
  // This checkout uses regular npm directories, not linked workspace packages.
  // Avoid Windows mapped-drive discovery via `net use` during resolution.
  resolve: { preserveSymlinks: true },
  // Plain CSS: no parent-directory PostCSS configuration is required.
  css: { postcss: { plugins: [] } },
  // Rollup's call-argument tree-shaking recursively expands the SDK/viem graph
  // in this pinned dependency set. Keep the complete graph rather than hanging.
  build: { rollupOptions: { treeshake: false } },
});
