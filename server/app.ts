import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import googleAuthRoutes from './routes/googleAuthRoutes';

const app: Application = express();

// Allow client origin and credentials (adjust CLIENT_URL in .env)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(morgan('dev') as express.RequestHandler);
app.use(cookieParser() as express.RequestHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;