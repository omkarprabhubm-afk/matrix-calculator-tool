import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 'base' configures the path for assets. './' allows the app to run in subdirectories 
  // (like https://username.github.io/repo-name/)
  base: './', 
});