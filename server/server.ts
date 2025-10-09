import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import { webSocketService } from './services';
import jobManager from './jobs';

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
webSocketService.initialize(server);

// Connect to database
connectDB();

// Background jobs are automatically started by JobManager

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket service enabled`);
  console.log(`📊 Background jobs started`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
    console.error(`💡 Try running: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  jobManager.stopAll();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  jobManager.stopAll();
  server.close(() => {
    console.log('Process terminated');
  });
});

export default server;
