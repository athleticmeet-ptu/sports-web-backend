const express = require('express');
const router = express.Router();
const { getStudentProfile, updateStudentProfile,submitStudentProfile } = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, isStudent, getStudentProfile);
router.put('/profile', verifyToken, isStudent, updateStudentProfile);

// Submit profile for session registration
router.post('/submit-profile', verifyToken, isStudent, submitStudentProfile);

module.exports = router;
