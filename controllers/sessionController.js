// controllers/sessionController.js
const Session = require('../models/session');

exports.createSession = async (req, res) => {
  const { startMonth, year } = req.body;  // Removed semester from destructuring

  try {
    if (!['Jan', 'July'].includes(startMonth)) {
      return res.status(400).json({ message: 'Invalid start month' });
    }
    if (!year || isNaN(year)) {
      return res.status(400).json({ message: 'Invalid year' });
    }

    // Build label
    const session =
      startMonth === 'Jan'
        ? `Jan–July ${year}`
        : `July–Dec ${year}`;

    // Calculate start and end dates
    const startDate =
      startMonth === 'Jan'
        ? new Date(`${year}-01-01`)
        : new Date(`${year}-07-01`);

    const endDate =
      startMonth === 'Jan'
        ? new Date(`${year}-07-31`)
        : new Date(`${year}-12-31`);

    // Deactivate all sessions
    await Session.updateMany({}, { isActive: false });

    const newSession = new Session({
      session,
      startDate,
      endDate,
      isActive: true
    });

    await newSession.save();

    res.status(201).json({
      message: 'New session created and activated',
      session: newSession
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating session', error: err.message });
  }
};

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ isActive: true });
    if (!activeSession) {
      return res.status(404).json({ message: 'No active session found' });
    }
    res.json(activeSession);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active session' });
  }
};

exports.setActiveSession = async (req, res) => {
  const sessionId = req.params.id;

  try {
    await Session.updateMany({}, { isActive: false });
    const session = await Session.findByIdAndUpdate(sessionId, { isActive: true }, { new: true });

    res.json({ message: 'Session activated', session });
  } catch (err) {
    res.status(500).json({ message: 'Error setting session active', error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting session' });
  }
};
