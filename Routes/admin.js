const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getPendingProfiles,
  updateTeamStatus,
  getPendingTeams,
  rejectStudentProfile,
  approveStudentProfile
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// User management
router.post('/create-user', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);

// Student profile approvals
router.get('/pending-profiles', verifyToken, isAdmin,getPendingProfiles);

// Approve student
router.put('/student/:id/approve', verifyToken, isAdmin,approveStudentProfile);

// Reject student
router.delete('/student/:id/reject', verifyToken, isAdmin,rejectStudentProfile);

// Team approvals
router.get('/pending-teams', verifyToken, isAdmin, getPendingTeams);
router.put('/team/:teamId/status', verifyToken, isAdmin, updateTeamStatus);

module.exports = router;
