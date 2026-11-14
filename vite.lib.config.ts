import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json' with { type: 'json' };
export default defineConfig({ plugins: [react()], build: { outDir: 'lib', copyPublicDir: false, lib: { entry: 'src/components/index.ts', formats: ['es'], fileName: 'avyntora', cssFileName: 'avyntora' }, rollupOptions: { output: { banner: "'use client';" }, external: id=>['react','react-dom',...Object.keys(pkg.dependencies)].some(name=>id===name||id.startsWith(name+'/')) } } });
