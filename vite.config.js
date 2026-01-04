import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: (() => {
    const fromEnv = process.env.VITE_BASE_PATH;
    const isGitHubPages = process.env.GITHUB_PAGES === 'true' || (process.env.GITHUB_REPOSITORY || '').endsWith('/ColorGameRoyale');
    if (fromEnv) return fromEnv;
    if (isGitHubPages) return '/ColorGameRoyale/';
    return '/';
  })(),
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
  ]
});
