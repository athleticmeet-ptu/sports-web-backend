// models/TeamMember.js
const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  sport: String,
  captainId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true }
}, { timestamps: true });

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
