const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  studentId: { type: String, unique: true },

  // Refers to an actual session document
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session'},
  semester: { type: String },

  personalDetails: {
    dob: Date,
    gender: String,
    contact: String,
    address: String,
  },

  isRegistered: { type: Boolean, default: false },         // Awaiting admin approval
  lockedForUpdate: { type: Boolean, default: false },      // Lock after approval
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
