const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);

    // Generate captainId if role is captain
    let captainId = null;
    if (role === 'captain') {
      // Format: CAPT<YEAR>-<RANDOM3DIGITS>
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900); // 100–999
      captainId = `CAPT${year}-${randomNum}`;
    }

    const newUser = new User({
      name,
      email,
      password: hashed,
      role,
      ...(captainId && { captainId }) // only add captainId if it's captain
    });

    await newUser.save();

    res.status(201).json({
      message: `${role} created successfully`,
      ...(captainId && { captainId }) // return id so admin sees it
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
};


exports.getAllUsers = async (req, res) => {
  const users = await User.find({}, 'name email role');
  res.json(users);
};
exports.getPendingProfiles = async (req, res) => {
  try {
    const pending = await StudentProfile.find({ isRegistered: false, lockedForUpdate: true }).populate('userId');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending profiles', error: err.message });
  }
};

// POST /admin/approve/:id
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