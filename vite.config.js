import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const repoName = 'react-search-bar-vite-1.3.0';

// https://vitejs.dev/config/
export default defineConfig({
  base: `/${repoName}/`,
  plugins: [react()],
  base:"/react-search-bar-vite-1.3.0/",
  
})
// having a base (see above) changes the local page address