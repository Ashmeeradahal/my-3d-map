import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  base: '/my-3d-map/',   // ← must equal your future GitHub repository name
  plugins: [cesium()],
});