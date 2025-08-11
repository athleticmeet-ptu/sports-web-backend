const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getPendingProfiles,
  approveStudentProfile,
  updateTeamStatus,
  getPendingTeams
} = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// User management
router.post('/create-user', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);

// Student profile approvals
router.get('/pending-profiles', verifyToken, isAdmin, getPendingProfiles);
router.post('/approve/:id', verifyToken, isAdmin, approveStudentProfile);

// Team approvals
router.get('/pending-teams', verifyToken, isAdmin, getPendingTeams);
router.put('/team/:teamId/status', verifyToken, isAdmin, updateTeamStatus);

module.exports = router;
