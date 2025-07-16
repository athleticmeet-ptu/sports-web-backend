const express = require('express');
const router = express.Router();
const { getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');

router.get('/profile', verifyToken, isStudent, getStudentProfile);
router.put('/profile', verifyToken, isStudent, updateStudentProfile);

module.exports = router;
