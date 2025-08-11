// routes/captain.js
const express = require('express');
const router = express.Router();
const CaptainTeam = require('../models/TeamMember');
const Session = require('../models/session');
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const resolveSession = require('../middleware/resolveSession');

/**
 * GET captain's team for a given session
 * If no sessionId is provided, active session is used.
 * Shows status (pending, approved, rejected).
 */
router.get(
  '/my-team',
  verifyToken,
  roleCheck('captain'),
  resolveSession,
  async (req, res) => {
    try {
      const sessionId = req.query.sessionId || req.resolvedSessionId;

      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const team = await CaptainTeam.findOne({
        captainId: req.user._id,
        sessionId
      });

      if (!team) {
        return res.json({
          isFirstTime: true,
          sessionId,
          status: null
        });
      }

      res.json({
        team,
        isFirstTime: false,
        status: team.status, // pending, approved, rejected
        sessionId,
        sessionActive: session.isActive
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching team', error: err.message });
    }
  }
);

/**
 * POST create team for the current session
 * Blocks creation if team already exists or session is inactive.
 * Sets initial status to "pending" for admin approval.
 */
router.post(
  '/my-team',
  verifyToken,
  roleCheck('captain'),
  resolveSession,
  async (req, res) => {
    try {
      const sessionId = req.resolvedSessionId;
      const session = await Session.findById(sessionId);

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (!session.isActive) {
        return res.status(400).json({
          message: 'Cannot create a team for an inactive session'
        });
      }

      const existingTeam = await CaptainTeam.findOne({
        captainId: req.user._id,
        sessionId
      });
      if (existingTeam) {
        return res.status(400).json({
          message: 'Team already exists for this session'
        });
      }

      const newTeam = new CaptainTeam({
        ...req.body,
        captainId: req.user._id,
        sessionId,
        status: 'pending'
      });
      await newTeam.save();

      res.json({
        message: 'Team submitted for admin approval',
        team: newTeam
      });
    } catch (err) {
      res.status(500).json({ message: 'Error creating team', error: err.message });
    }
  }
);

/**
 * PUT update team for current session
 * Allowed only if session is active and team is still pending.
 */
router.put(
  '/my-team',
  verifyToken,
  roleCheck('captain'),
  resolveSession,
  async (req, res) => {
    try {
      const session = await Session.findById(req.resolvedSessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (!session.isActive) {
        return res.status(400).json({ message: 'Cannot update team for inactive session' });
      }

      const team = await CaptainTeam.findOne({
        captainId: req.user._id,
        sessionId: req.resolvedSessionId
      });

      if (!team) {
        return res.status(404).json({ message: 'No team found for this session' });
      }

      if (team.status !== 'pending') {
        return res.status(400).json({
          message: 'Cannot update a team that has been approved or rejected'
        });
      }

      Object.assign(team, req.body);
      await team.save();

      res.json({ message: 'Team updated', team });
    } catch (err) {
      res.status(500).json({ message: 'Error updating team', error: err.message });
    }
  }
);

/**
 * DELETE team for current session
 * Allowed only if session is active and team is still pending.
 */
router.delete(
  '/my-team',
  verifyToken,
  roleCheck('captain'),
  resolveSession,
  async (req, res) => {
    try {
      const session = await Session.findById(req.resolvedSessionId);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (!session.isActive) {
        return res.status(400).json({ message: 'Cannot delete team for inactive session' });
      }

      const deleted = await CaptainTeam.findOneAndDelete({
        captainId: req.user._id,
        sessionId: req.resolvedSessionId,
        status: 'pending'
      });

      if (!deleted) {
        return res.status(404).json({
          message: 'No pending team found to delete for this session'
        });
      }

      res.json({ message: 'Team deleted for this session' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting team', error: err.message });
    }
  }
);

module.exports = router;
