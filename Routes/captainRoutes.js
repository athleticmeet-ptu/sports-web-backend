const express = require('express');
const router = express.Router();
const CaptainTeam = require('../models/TeamMember');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const attachActiveSession = require('../middleware/activeSession');

// Get captain's current team
router.get('/my-team',
  verifyToken,
  roleCheck('captain'),
  attachActiveSession,
  async (req, res) => {
    const team = await CaptainTeam.findOne({
      captainId: req.user._id,
      sessionId: req.activeSessionId
    });
    res.json(team);
  }
);

// Create team (first-time)
router.post('/my-team',
  verifyToken,
  roleCheck('captain'),
  attachActiveSession,
  async (req, res) => {
    const newTeam = new CaptainTeam({
      ...req.body,
      captainId: req.user._id,
      sessionId: req.activeSessionId
    });
    await newTeam.save();
    res.json(newTeam);
  }
);

// Update team
router.put('/my-team',
  verifyToken,
  roleCheck('captain'),
  attachActiveSession,
  async (req, res) => {
    const team = await CaptainTeam.findOneAndUpdate(
      { captainId: req.user._id, sessionId: req.activeSessionId },
      req.body,
      { new: true }
    );
    res.json(team);
  }
);

// Delete team
router.delete('/my-team',
 verifyToken,
  roleCheck('captain'),
  attachActiveSession,
  async (req, res) => {
    await CaptainTeam.findOneAndDelete({
      captainId: req.user._id,
      sessionId: req.activeSessionId
    });
    res.json({ message: 'Team deleted' });
  }
);

module.exports = router;
