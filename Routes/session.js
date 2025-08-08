// routes/session.js
const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Admin-only: Create a new session
router.post('/create', verifyToken, isAdmin, sessionController.createSession);

// Public: Get all sessions
router.get('/', sessionController.getAllSessions);

// Public: Get current active session
router.get('/active', sessionController.getActiveSession);

// Admin-only: Set a specific session as active
router.put('/set-active/:id', verifyToken, isAdmin, sessionController.setActiveSession);

// Admin-only: Delete a session
router.delete('/:id', verifyToken, isAdmin, sessionController.deleteSession);

module.exports = router;
