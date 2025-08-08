const StudentProfile = require('../models/studentprofile');
const User = require('../models/User');
const Session = require('../models/session');

// Utility function to generate a student ID
const generateStudentId = () => {
  return 'STU-' + Math.floor(100000 + Math.random() * 900000); // Simple random ID
};

exports.getStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user.id });

    // Auto-create profile if missing
    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user.id,
        studentId: generateStudentId(),
        session: null,
        semester: '',
        personalDetails: {},
        isRegistered: false
      });

      await User.findByIdAndUpdate(req.user.id, { studentProfile: profile._id });
    }

    res.json(profile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id; // From middleware
    const updateData = req.body;

    // Ensure session is a valid ObjectId
    if (updateData.session && !updateData.session.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }

    const updatedProfile = await StudentProfile.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('session');

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.status(200).json(updatedProfile);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.submitStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Lock profile to prevent updates until admin reviews
    profile.lockedForUpdate = true;

    await profile.save();

    res.json({ message: 'Profile submitted for admin approval' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
