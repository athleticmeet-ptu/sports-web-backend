const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();
const createAdminIfNotExists = require('./controllers/CreateAdmin');
const User = require('./models/User');
const authRoutes = require('./Routes/auth');
const adminRoutes = require('./Routes/admin');
const studentRoutes = require('./Routes/student');
const teacherRoutes = require('./Routes/teacher');

const app = express();
app.use(cors({
  origin: 'https://sports-web-frontend.vercel.app',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);




const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await createAdminIfNotExists(); // 👈 Create admin at startup

    app.listen(5000, () => {
      console.log('🚀 Server running on http://localhost:5000');
    });
  } catch (err) {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  }
};


// inside startServer

startServer();
