import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Serves POST /api/analyze-food during `vite dev` and `vite preview` so the
// photo-calorie feature works on Replit / locally without Vercel. On Vercel the
// real serverless function (api/analyze-food.js) handles the same route.
function foodApiPlugin() {
  const handler = async (req, res) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end('Method not allowed');
      return;
    }
    const send = (status, obj) => {
      res.statusCode = status;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(obj));
    };
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
      const { analyzeFood } = await import('./server/analyzeFood.js');
      send(200, await analyzeFood(body));
    } catch (e) {
      const status = e?.status && e.status >= 400 && e.status < 600 ? e.status : 500;
      send(status, { error: e?.code || 'ANALYSIS_FAILED', detail: String(e?.message || e).slice(0, 300) });
    }
  };
  return {
    name: 'food-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze-food', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/analyze-food', handler);
    },
  };
}

export default defineConfig({
  plugins: [
    foodApiPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'favicon.svg'],
      manifest: {
        name: 'FitForge — Fitness & Meal Prep',
        short_name: 'FitForge',
        description: 'Personal fitness training plan, meal prep, and calorie tracking.',
        theme_color: '#0e1116',
        background_color: '#0e1116',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache the app shell for offline use. The food-vision API is a
        // network call and is intentionally NOT cached (NetworkOnly).
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'POST',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true, // allow Replit's proxy host header
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
  },
});
