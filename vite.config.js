import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ GitHub Pages: `base` MUST match your repo name, wrapped in slashes.
// If your repo is github.com/you/meddeck  ->  base: '/meddeck/'
// If you rename the repo, change this too.
export default defineConfig({
  plugins: [react()],
  base: '/MedDeck/',
})
