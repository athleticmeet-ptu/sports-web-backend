const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const mongoose = require('mongoose');
// Utility function to generate a student ID
const generateStudentId = () => {
  return 'STU-' + Math.floor(100000 + Math.random() * 900000);
};

// GET profile
exports.getStudentProfile = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      userId: req.user.id,
      session: req.resolvedSessionId
    }).populate('session');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for this session' });
    }

    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure sports is always an array, and use admin-filled sports if available
    const sports = Array.isArray(profile.sports)
      ? profile.sports
      : (profile.sport ? [profile.sport] : []);

    res.json({
      name: user.name || profile.name || '',
      email: user.email || '',
      branch: profile.branch || '',
      urn: profile.urn || '',
      year: profile.year || '',
      sports, // ✅ prefilled sports visible to student
      dob: profile.dob || '',
      gender: profile.gender || '',
      contact: profile.contact || '',
      address: profile.address || '',
      lockedForUpdate: !!profile.lockedForUpdate,
      pendingUpdateRequest: profile.pendingUpdateRequest || null,
      isRegistered: !!profile.isRegistered,
      notifications: profile.notifications || []
    });

  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



// CREATE or UPDATE profile
exports.updateStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      userId: req.user.id,
      session: req.resolvedSessionId
    });

    if (!profile) {
      const user = await User.findById(req.user.id).lean();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      profile = new StudentProfile({
        userId: req.user.id,
        studentId: generateStudentId(),
        name: user.name || '',
        email: user.email || '',
        branch: user.branch || '',
        urn: user.urn || '',
        year: user.year || '',
        sports: [], // initialize array
        session: req.resolvedSessionId,
        isRegistered: false,
        lockedForUpdate: false
      });
    }

    if (profile.lockedForUpdate) {
      return res.status(400).json({ error: 'Profile is locked for admin review' });
    }

    // Assign non-sport fields
    ['name', 'email', 'branch', 'urn', 'year', 'dob', 'gender', 'contact', 'address']
      .forEach(field => {
        if (req.body[field] !== undefined) {
          profile[field] = req.body[field];
        }
      });

    // Handle sports (new array or fallback old string)
    if (Array.isArray(req.body.sports)) {
      profile.sports = req.body.sports;
    } else if (req.body.sport !== undefined) {
      profile.sports = [req.body.sport];
    }

    await profile.save();
    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SUBMIT profile for approval
exports.submitStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({
      userId: req.user.id,
      session: req.resolvedSessionId
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Assign non-sport fields if provided
    ['name', 'email', 'branch', 'urn', 'year', 'dob', 'gender', 'contact', 'address']
      .forEach(field => {
        if (req.body[field] !== undefined) {
          profile[field] = req.body[field];
        }
      });

    // Handle sports: merge new sports with existing ones
    const newSports = Array.isArray(req.body.sports)
      ? req.body.sports
      : req.body.sport !== undefined
        ? [req.body.sport]
        : [];

    if (newSports.length > 0) {
      profile.sports = Array.from(new Set([...(profile.sports || []), ...newSports]));
    }

    profile.lockedForUpdate = true; // lock for admin review
    await profile.save();

    res.json({ message: 'Profile submitted for admin approval', profile });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /student/mark-notifications-read
exports.markNotificationsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No notification IDs provided' });
    }

    // Convert string IDs to ObjectId (with new keyword)
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));

    const profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { "notifications.$[n].read": true } },
      { arrayFilters: [{ "n._id": { $in: objectIds } }], new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

