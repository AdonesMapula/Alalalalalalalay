import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Built-in Node.js scraper proxy plugin for Vite dev server.
 * Completely eliminates browser CORS restrictions when scraping external websites and Facebook portals.
 */
function liveScraperProxyPlugin() {
  return {
    name: 'live-scraper-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy-scrape', async (req, res) => {
        try {
          const rawPath = req.originalUrl || req.url;
          const urlObj = new URL(rawPath, `http://${req.headers.host || 'localhost:5173'}`);
          let targetUrl = urlObj.searchParams.get('url');

          if (!targetUrl) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.end(JSON.stringify({ error: 'Missing url parameter', success: false }));
            return;
          }

          // If target is Facebook, use mobile endpoint for cleaner DOM
          if (targetUrl.includes('facebook.com') && !targetUrl.includes('m.facebook.com')) {
            targetUrl = targetUrl.replace('www.facebook.com', 'm.facebook.com');
          }

          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
          });

          const html = await response.text();
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200; // Always return 200 so client Cheerio can inspect content
          res.end(html);
        } catch (err) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          res.end(JSON.stringify({ error: err.message || 'Scrape proxy failed', success: false }));
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
