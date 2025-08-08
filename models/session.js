const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  session: {
    type: String, // e.g. "2024-25"
    required: true
  },
  semester: {
    type: String, // e.g. "Sem 1"
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
