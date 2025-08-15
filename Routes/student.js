const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const Session = require('../models/session');
const User = require('../models/User');
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  submitStudentProfile,
  markNotificationsRead
} = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const resolveSession = require('../middleware/resolveSession');

// Get student profile for specific session (or active session if none specified)
router.get('/profile', verifyToken, isStudent, resolveSession, getStudentProfile);

// Update profile for active session only
router.put('/profile', verifyToken, isStudent, resolveSession, updateStudentProfile);

// Submit profile for session registration (active session only)
router.post('/submit-profile', verifyToken, isStudent, resolveSession, submitStudentProfile);
router.post('/mark-notifications-read', verifyToken, markNotificationsRead);

// routes/student.js
router.get('/my-sessions', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all profiles for this student
    const profiles = await StudentProfile.find({ userId }, 'session').lean();
    const sessionIdsWithProfile = profiles.map(p => p.session?.toString()).filter(Boolean);

    // Get active session
    const activeSession = await Session.findOne({ isActive: true }).lean();

    // If no profile exists for active session, create it now
    if (activeSession && !sessionIdsWithProfile.includes(activeSession._id.toString())) {
      const user = await User.findById(userId);
      const newProfile = new StudentProfile({
        userId,
        session: activeSession._id,
        name: user.name,
        urn: user.urn,
        branch: user.branch,
        year: user.year,
        sports: [],
        isRegistered: false
      });
      await newProfile.save();
      sessionIdsWithProfile.push(activeSession._id.toString());
    }

    // Fetch all sessions that match these IDs
    const sessions = await Session.find({ _id: { $in: sessionIdsWithProfile } }).lean();

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching student sessions' });
  }
});


module.exports = router;
