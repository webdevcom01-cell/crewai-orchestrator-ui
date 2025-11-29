import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isAnalyze = mode === 'analyze';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
          manifest: {
            name: 'CrewAI Orchestrator',
            short_name: 'CrewAI',
            description: 'Visual AI Agent Orchestration Platform',
            theme_color: '#080F1A',
            background_color: '#050608',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/icons/icon-72x72.png',
                sizes: '72x72',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-128x128.png',
                sizes: '128x128',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-144x144.png',
                sizes: '144x144',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-152x152.png',
                sizes: '152x152',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-384x384.png',
                sizes: '384x384',
                type: 'image/png',
                purpose: 'maskable any'
              },
              {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable any'
              }
            ]
          },
          workbox: {
            // Cache strategies
            runtimeCaching: [
              {
                // Cache API responses
                urlPattern: /^https?:\/\/.*\/api\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 // 24 hours
                  },
                  networkTimeoutSeconds: 10,
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                // Cache static assets
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                  }
                }
              },
              {
                // Cache fonts
                urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  }
                }
              },
              {
                // Cache JS/CSS
                urlPattern: /\.(?:js|css)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'static-resources',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                  }
                }
              }
            ],
            // Skip waiting for immediate activation
            skipWaiting: true,
            clientsClaim: true,
            // Precache all assets
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
          },
          devOptions: {
            enabled: true // Enable PWA in development for testing
          }
        }),
        // Bundle analyzer - only in analyze mode
        isAnalyze && visualizer({
          open: true,
          filename: 'dist/bundle-stats.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap', // 'sunburst', 'network', 'treemap'
        }),
      ].filter(Boolean),
      
      // Build optimizations
      build: {
        // Target modern browsers
        target: 'es2020',
        
        // Enable source maps in production for error tracking
        sourcemap: mode === 'production',
        
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
        
        // Rollup options for optimal chunking
        rollupOptions: {
          output: {
            // Manual chunk splitting for better caching
            manualChunks: (id) => {
              // Vendor chunks
              if (id.includes('node_modules')) {
                // React core
                if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                  return 'react-vendor';
                }
                
                // State management
                if (id.includes('zustand') || id.includes('@tanstack')) {
                  return 'state-vendor';
                }
                
                // UI libraries
                if (id.includes('@dnd-kit') || id.includes('framer-motion')) {
                  return 'ui-vendor';
                }
                
                // i18n
                if (id.includes('i18next') || id.includes('react-i18next')) {
                  return 'i18n-vendor';
                }
                
                // Monitoring
                if (id.includes('@sentry') || id.includes('web-vitals')) {
                  return 'monitoring-vendor';
                }
                
                // Other vendor code
                return 'vendor';
              }
              
              // App chunks by feature
              if (id.includes('/components/Dashboard')) {
                return 'dashboard';
              }
              if (id.includes('/components/Collaboration') || id.includes('/components/collaboration')) {
                return 'collaboration';
              }
              if (id.includes('/components/TemplatesLibrary')) {
                return 'templates';
              }
              if (id.includes('/components/AuditLog')) {
                return 'audit';
              }
              if (id.includes('/components/NotificationsCenter')) {
                return 'notifications';
              }
            },
            
            // Consistent chunk naming
            chunkFileNames: (chunkInfo) => {
              const name = chunkInfo.name || 'chunk';
              return `assets/${name}-[hash].js`;
            },
            
            // Asset file names
            assetFileNames: (assetInfo) => {
              const info = assetInfo.name?.split('.') || [];
              const ext = info[info.length - 1];
              
              if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                return 'assets/images/[name]-[hash][extname]';
              }
              if (/woff2?|eot|ttf|otf/i.test(ext)) {
                return 'assets/fonts/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },
          },
        },
        
        // Minification options
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: true,
            pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
          },
          mangle: {
            safari10: true,
          },
          format: {
            comments: false,
          },
        },
        
        // CSS code splitting
        cssCodeSplit: true,
        
        // Asset inlining threshold (4kb)
        assetsInlineLimit: 4096,
      },
      
      // Dependency optimization
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'zustand',
          '@tanstack/react-query',
          'react-i18next',
        ],
        exclude: [
          // Exclude packages that don't need pre-bundling
        ],
      },
      define: {
        // Backend URL for secure API proxy
        // API keys are now only on backend - frontend never sees them
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
          env.VITE_BACKEND_URL || 'http://localhost:8000/api'
        )
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
