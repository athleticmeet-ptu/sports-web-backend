const express = require("express");
const Attendance = require("../models/Attendence");
const { verifyToken, isAdmin, isTeacher } = require("../middleware/authMiddleware");
const router = express.Router();

// ✅ Mark Attendance (Admin + Teacher dono kar sakte)
router.post("/mark", verifyToken,isAdmin, (req, res, next) => {
  // Allow admin OR teacher
if (!["admin", "teacher"].includes(req.user.activeRole)) {
  return res.status(403).json({ message: "Only admin or teacher can mark attendance" });
}

next();

}, async (req, res) => {
  try {
    const { studentId, status, sessionId, date } = req.body;

    const attendanceDate = date ? new Date(date) : new Date();

    // Prevent duplicate for same student + same date
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    let existing = await Attendance.findOne({
      student: studentId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) {
      existing.status = status;
      existing.markedBy = req.user._id; // ✅ overwrite by current user
      await existing.save();
      return res.json({ message: "Attendance updated", record: existing });
    }

    // 🔹 New attendance
    const record = new Attendance({
      student: studentId,
      status,
      session: sessionId,
      markedBy: req.user._id, // ✅ set automatically
      date: attendanceDate,
    });

    await record.save();
    res.status(201).json({ message: "Attendance marked", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
});

// ✅ Get Attendance by Date (Admin + Teacher)
router.get("/:date", verifyToken, (req, res, next) => {
  if (req.user.activeRole !== "admin" && req.user.activeRole !== "teacher") {
    return res.status(403).json({ message: "Only admin or teacher can view attendance" });
  }
  next();
}, async (req, res) => {
  try {
    const { date } = req.params;
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: start, $lt: end },
    })
      .populate("student", "name urn crn branch year sport")
      .populate("markedBy", "name email role");

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
});

module.exports = router;
