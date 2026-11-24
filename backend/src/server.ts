import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { env } from './config/env';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';

// ─── Express App ─────────────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ─── Socket.IO ───────────────────────────────────────────
export const io = new SocketServer(httpServer, {
  cors: corsOptions,
});

// ─── Middleware ──────────────────────────────────────────
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────
app.use('/api', routes);

// ─── Error Handler (must be last) ───────────────────────
app.use(errorHandler);

// ─── Socket.IO Connection ───────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───────────────────────────────────────
httpServer.listen(env.PORT, () => {
  console.log(`\n🚀 Server running on port ${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`💚 Health check: http://localhost:${env.PORT}/api/health\n`);
});
