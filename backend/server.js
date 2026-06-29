require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDatabase = require('./config/database');

const app = express();

const authRoutes = require('./routes/authRoutes');

const userRoutes = require('./routes/userRoutes');

connectDatabase();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'React Native JWT Authentication API'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});