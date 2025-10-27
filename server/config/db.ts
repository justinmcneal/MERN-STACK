import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    const { host, port, name } = conn.connection;
    logger.success(`MongoDB Connected: ${host}:${port}/${name}`);
  } catch (error: any) {
    logger.error('MongoDB connection failed', error);
    process.exit(1);
  }
};

export default connectDB;