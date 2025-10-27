import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import googleAuthRoutes from './routes/googleAuthRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import tokenRoutes from './routes/tokenRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import preferenceRoutes from './routes/preferenceRoutes';
import profileRoutes from './routes/profileRoutes';
import alertRoutes from './routes/alertRoutes';
import systemRoutes from './routes/systemRoutes';
import websocketRoutes from './routes/websocketRoutes';
import contactSupportRoutes from './routes/contactSupportRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev') as express.RequestHandler);
app.use(cookieParser() as express.RequestHandler);

app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/auth/2fa', twoFactorRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/websocket', websocketRoutes);
app.use('/api/support', contactSupportRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
