import { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl/mobile requests without origin header
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Parse comma-separated or single FRONTEND_URL
    const configuredOrigins = (env.FRONTEND_URL || '')
      .split(',')
      .map((url) => url.trim().replace(/\/+$/, ''))
      .filter(Boolean);

    const defaultOrigins = [
      'https://salon-management-assignment-2026120.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:5173',
    ];

    const allowedOrigins = new Set([...configuredOrigins, ...defaultOrigins]);

    // Check if origin is explicitly allowed or matches a vercel.app domain or non-production mode
    const isVercelDomain = /^https:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.vercel\.app$/.test(cleanOrigin);

    const isAllowed =
      allowedOrigins.has(cleanOrigin) ||
      isVercelDomain ||
      env.NODE_ENV !== 'production';

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

