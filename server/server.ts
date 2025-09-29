import 'dotenv/config';
import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import { webSocketService } from './services';
import opportunityScanner from './jobs/opportunityScanner';
import dataPipeline from './jobs/dataPipeline';

const PORT = process.env.PORT || 5001;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
webSocketService.initialize(server);

// Connect to database
connectDB();

// Start background jobs
const opportunityScannerInstance = new opportunityScanner();
  opportunityScannerInstance.startScheduledScans();
const dataPipelineInstance = new dataPipeline();
  dataPipelineInstance.startDataPipeline();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket service enabled`);
  console.log(`📊 Background jobs started`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default server;
