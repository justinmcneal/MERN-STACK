import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import { webSocketService } from './services';
import jobManager from './jobs';
import logger from './utils/logger';

const PORT = process.env.PORT || 5001;
const server = createServer(app);

webSocketService.initialize(server);
connectDB();

server.listen(PORT, () => {
  logger.success(`Server running on port ${PORT}`);
  logger.info('WebSocket service enabled');
  logger.info('Background jobs started');
}).on('error', handleServerError);

function handleServerError(err: NodeJS.ErrnoException): void {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
    logger.info(`Try: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    logger.error('Server error', err);
  }
  process.exit(1);
}

function gracefulShutdown(signal: string): void {
  logger.warn(`${signal} received, shutting down gracefully`);
  jobManager.stopAll();
  server.close(() => {
    logger.success('Server closed. Process terminated');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
