const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'MERN Stack Server is running!' });
});

// Import your routes
const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const alertRoutes = require('./routes/alertRoutes');
const googleAuthRoutes = require('./routes/googleAuthRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/alerts', alertRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
