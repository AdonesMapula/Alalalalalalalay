import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Built-in Node.js scraper proxy plugin for Vite dev server.
 * Completely eliminates browser CORS restrictions when scraping external websites.
 */
function liveScraperProxyPlugin() {
  return {
    name: 'live-scraper-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy-scrape', async (req, res) => {
        try {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
          });

          const html = await response.text();
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = response.status || 200;
          res.end(html);
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Scrape proxy failed' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    liveScraperProxyPlugin(),
  ],
});
