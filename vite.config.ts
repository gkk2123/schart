import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');        // .env.* 로드

  return {
    // 1) GitHub Pages 하위 폴더용 base 경로
    base: mode === 'production' ? '/seatingchart/' : '/',

    plugins: [react()],

    // 2) 클라이언트 환경변수 (import.meta.env)
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    },

    // 3) 경로 Alias
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@types': path.resolve(__dirname, './src/types')
      }
    },

    // 4) 로컬 개발 서버
    server: {
      port: 5173,
      open: true,
      cors: true
    },

    // 5) 빌드 옵션
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'esbuild',
      target: 'es2015',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'dnd-kit': ['@dnd-kit/core', '@dnd-kit/utilities']
          }
        }
      }
    },

    // 6) 사전 번들(개발 속도 최적화)
    optimizeDeps: {
      include: ['react', 'react-dom', '@dnd-kit/core', 'zod']
    }
  };
});
