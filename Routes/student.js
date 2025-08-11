const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  updateStudentProfile,
  submitStudentProfile
} = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');
const resolveSession = require('../middleware/resolveSession');

// Get student profile for specific session (or active session if none specified)
router.get('/profile', verifyToken, isStudent, resolveSession, getStudentProfile);

// Update profile for active session only
router.put('/profile', verifyToken, isStudent, resolveSession, updateStudentProfile);

// Submit profile for session registration (active session only)
router.post('/submit-profile', verifyToken, isStudent, resolveSession, submitStudentProfile);

module.exports = router;
