import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        // When you wire this up to the Django backend, uncomment and point
        // this at your local Django dev server so /api calls work in dev
        // without CORS headaches.
        // proxy: {
        //   '/api': {
        //     target: 'http://localhost:8000',
        //     changeOrigin: true,
        //   },
        // },
    },
});
