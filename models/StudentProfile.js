// models/StudentProfile.js
const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  name: String,
  urn: { type: String, unique: true },
  branch: String,
  year: Number,
  sports: [{ type: String }],
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },

  dob: Date,
  gender: String,
  contact: String,
  address: String,

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
