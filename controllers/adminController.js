const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const TeamMember = require('../models/TeamMember');
const bcrypt = require('bcrypt');

// Create user (unchanged)
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    let captainId = null;
    if (role === 'captain') {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900);
      captainId = `CAPT${year}-${randomNum}`;
    }

    const newUser = new User({
      name,
      email,
      password: hashed,
      role,
      ...(captainId && { captainId })
    });

    await newUser.save();

    res.status(201).json({
      message: `${role} created successfully`,
      ...(captainId && { captainId })
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};

// Get all users (unchanged)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Get all pending student profiles (unchanged)
exports.getPendingProfiles = async (req, res) => {
  try {
    const pending = await StudentProfile.find({
      isRegistered: false,
      lockedForUpdate: true
    }).populate('userId');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending profiles', error: err.message });
  }
};

// Approve student profile (unchanged)
exports.approveStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.isRegistered = true;
    profile.lockedForUpdate = false;

    await profile.save();

    res.json({ message: 'Student profile approved' });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed', error: err.message });
  }
};

// **Get pending teams for approval (updated)**
exports.getPendingTeams = async (req, res) => {
  try {
    // Disable caching to ensure fresh data
    res.set('Cache-Control', 'no-store');

    const pendingTeams = await TeamMember.find({ status: 'pending' })
      .populate('captainId', 'name email')
      .populate('sessionId', 'session')
      .lean();

    res.json(pendingTeams || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending teams', error: err.message });
  }
};

// **Approve or reject team (updated)**
exports.updateTeamStatus = async (req, res) => {
  try {
    const { status } = req.body; // expected "approved" or "rejected"

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const team = await TeamMember.findByIdAndUpdate(
      req.params.teamId,
      { status },
      { new: true }
    )
      .populate('captainId', 'name email')
      .populate('sessionId', 'session');

    if (!team) return res.status(404).json({ message: 'Team not found' });

    res.json({ message: `Team ${status}`, team });
  } catch (err) {
    res.status(500).json({ message: 'Error updating team status', error: err.message });
  }
};
