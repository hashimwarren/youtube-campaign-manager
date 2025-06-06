import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // If you're testing React components, or if Next.js setup needs it for JSX
import tsconfigPaths from 'vite-tsconfig-paths'; // To use tsconfig paths like @/*

export default defineConfig({
  plugins: [
    react(), // Add this if you encounter issues with JSX or React-specific syntax in tests
    tsconfigPaths(), // To resolve paths like @/lib/db
  ],
  test: {
    globals: true, // Use global APIs like describe, it, expect
    environment: 'jsdom', // Or 'node' if no DOM interaction is needed for most tests
    setupFiles: [], // Optional: if you need setup files, e.g., './src/tests/setup.ts'
    // reporters: ['default', 'html'], // Optional: For test reports
  },
});
