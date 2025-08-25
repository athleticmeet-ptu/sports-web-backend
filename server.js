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
const sessionRoutes = require('./Routes/session');
const captainRoutes = require('./Routes/captainRoutes');
const gymSwimmingRoutes = require("./Routes/gymSwimming");
const attendanceRoutes = require("./Routes/Attendence");



const app = express();
app.use(cors({
  origin: 'https://sports-web-frontend.vercel.app' ||'https://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/captain', captainRoutes);
app.use("/api/gym-swimming", gymSwimmingRoutes);
app.use("/api/attendance", attendanceRoutes);



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
