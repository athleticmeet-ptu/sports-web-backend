const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
