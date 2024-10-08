// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/orrery/',
    build: {
        outDir: 'docs',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                app: resolve(__dirname, 'app.html'),
                learn: resolve(__dirname, 'learn.html'),
                credits: resolve(__dirname, 'credits.html'),
            },
        },
    },
});

