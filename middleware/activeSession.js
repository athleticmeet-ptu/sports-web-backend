const Session = require('../models/session');

async function attachActiveSession(req, res, next) {
  try {
    const activeSession = await Session.findOne({ isActive: true });
    if (!activeSession) {
      return res.status(400).json({ message: 'No active session found' });
    }
    req.activeSessionId = activeSession._id;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active session' });
  }
}

module.exports = attachActiveSession;
