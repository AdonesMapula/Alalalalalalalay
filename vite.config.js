import { defineConfig, loadEnv } from 'vite';
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

/**
 * Server-side Gemini AI Chat Proxy Middleware
 * Securely calls Google Gemini API without exposing API keys or tokens to client-side bundles.
 */
function alalayChatProxyPlugin() {
  const env = loadEnv('development', process.cwd(), '');
  const apiKey =
    process.env.GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    env.VITE_GEMINI_API ||
    env.EXPO_PUBLIC_GEMINI_API ||
    '';
  const reserveKey =
    process.env.GEMINI_API_KEY_RESERVE ||
    env.GEMINI_API_KEY_RESERVE ||
    env.VITE_GEMINI_API_RESERVE ||
    env.EXPO_PUBLIC_GEMINI_API_RESERVE ||
    '';

  const models = [
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3-flash-preview',
    'gemini-3.7-flash',
  ];

  return {
    name: 'alalay-chat-proxy',
    configureServer(server) {
      server.middlewares.use('/api/alalay/chat', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        try {
          let bodyStr = '';
          for await (const chunk of req) {
            bodyStr += chunk;
          }

          const { systemPrompt, userInstruction, temperature = 0.1, maxOutputTokens = 1400 } =
            JSON.parse(bodyStr || '{}');

          let activeKey = apiKey || reserveKey;
          if (!activeKey) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Gemini API Key is not configured on the server.' }));
            return;
          }

          let lastError = null;

          for (const model of models) {
            try {
              const isOAuthToken = activeKey.startsWith('ya29.');
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent${
                isOAuthToken ? '' : `?key=${activeKey}`
              }`;

              const headers = {
                'Content-Type': 'application/json',
              };

              if (isOAuthToken) {
                headers['Authorization'] = `Bearer ${activeKey}`;
              } else {
                headers['x-goog-api-key'] = activeKey;
              }

              const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  contents: [
                    {
                      role: 'user',
                      parts: [{ text: `${systemPrompt}\n\n${userInstruction}` }],
                    },
                  ],
                  generationConfig: {
                    temperature,
                    maxOutputTokens,
                  },
                }),
              });

              if (response.ok) {
                const data = await response.json();
                const rawText =
                  data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';

                if (rawText.trim().length > 0) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, text: rawText }));
                  return;
                }
              }

              if (response.status === 429 && reserveKey && activeKey !== reserveKey) {
                activeKey = reserveKey;
              }

              const errData = await response.json().catch(() => ({}));
              lastError = errData.error?.message || `HTTP ${response.status}`;
            } catch (err) {
              lastError = err.message;
            }
          }

          res.statusCode = 502;
          res.end(JSON.stringify({ success: false, error: lastError || 'All models failed.' }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }));
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'EXPO_PUBLIC_'],
  plugins: [
    react(),
    tailwindcss(),
    liveScraperProxyPlugin(),
    alalayChatProxyPlugin(),
  ],
});
