const express = require('express');
const router = express.Router();
const { createUser, getAllUsers,  getPendingProfiles,  // ✅ Add this
  approveStudentProfile,  } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/create-user', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);
// Get all students waiting for session approval
router.get('/pending-profiles', verifyToken, isAdmin, getPendingProfiles);

// Approve student for session
router.post('/approve/:id', verifyToken, isAdmin, approveStudentProfile);

module.exports = router;
