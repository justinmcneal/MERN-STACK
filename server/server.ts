import 'dotenv/config';

import connectDB from './config/db';
connectDB();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));