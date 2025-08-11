// models/TeamMember.js
const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  teamName: { type: String, required: true },
  email: String,
  sport: String,
  captainId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
