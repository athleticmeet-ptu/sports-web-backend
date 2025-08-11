const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Session = require('../models/session');

// Utility function to generate a student ID
const generateStudentId = () => {
  return 'STU-' + Math.floor(100000 + Math.random() * 900000);
};

// GET profile for the resolved session
exports.getStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      userId: req.user.id,
      session: req.resolvedSessionId
    }).populate('session');

    // Auto-create if missing for this session
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
        studentId: generateStudentId(),
        session:  req.query.sessionId || req.activeSessionId,
        semester: '',
        personalDetails: {},
        isRegistered: false,
        lockedForUpdate: false
      });

      await User.findByIdAndUpdate(req.user.id, { $addToSet: { studentProfiles: profile._id } });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE profile for resolved session
exports.updateStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user.id,
      session: req.resolvedSessionId
    });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.lockedForUpdate) {
      return res.status(400).json({ error: 'Profile is locked for admin review' });
    }

    Object.assign(profile, req.body);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SUBMIT profile for approval (resolved session)
exports.submitStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user.id,
      session: req.resolvedSessionId
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.lockedForUpdate = true;
    await profile.save();

    res.json({ message: 'Profile submitted for admin approval' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
