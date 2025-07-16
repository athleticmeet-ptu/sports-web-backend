const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentId: { type: String, unique: true },
  session: String,
  semester: String,
  personalDetails: {
    dob: Date,
    gender: String,
    contact: String,
    address: String,
  },
  isRegistered: { type: Boolean, default: false },
  lockedForUpdate: { type: Boolean, default: false },
  pendingUpdateRequest: {
    previousData: mongoose.Schema.Types.Mixed,
    updatedData: mongoose.Schema.Types.Mixed
  },
  notifications: [{
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
