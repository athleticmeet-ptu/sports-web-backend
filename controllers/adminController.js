const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Captain = require('../models/Captain');
const TeamMember = require('../models/TeamMember');
const bcrypt = require('bcrypt');

// CREATE USER (Admin)
const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    branch,
    urn,
    year,
    sport,   // old single sport
    sports,  // new multi-sport
    teamMemberCount,
    sessionId,
    rollNumber,
    course
  } = req.body;

  try {
    let existing = await User.findOne({ email });

    // Normalize sports input: convert single string or array to array, trim, remove empty
    const normalizedSports = [].concat(sports || sport || [])
      .map(s => s.trim())
      .filter(Boolean);

    let hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    let extraUserData = {};
    let generatedCaptainId = null;

    if (role === 'captain') {
      const currentYear = new Date().getFullYear();
      const randomNum = Math.floor(100 + Math.random() * 900);
      generatedCaptainId = `CAPT${currentYear}-${randomNum}`;
      extraUserData.captainId = generatedCaptainId;
    }

    if (existing) {
      // Merge sports if user already exists
      existing.sports = Array.from(new Set([...(existing.sports || []), ...normalizedSports]));
      if (hashedPassword) existing.password = hashedPassword;
      existing.name = name || existing.name;
      existing.branch = branch || existing.branch;
      existing.year = year || existing.year;
      await existing.save();
    } else {
      // Create new user
      existing = new User({
        name,
        email,
        password: hashedPassword,
        role,
        branch,
        urn,
        year,
        sports: normalizedSports,
        teamMemberCount,
        ...extraUserData
      });
      await existing.save();
    }

    if (role === 'captain') {
      await Captain.create({
        captainId: generatedCaptainId,
        studentId: null,
        name,
        branch,
        urn,
        year,
        sports: normalizedSports,
        teamMemberCount,
        session: sessionId,
        createdBy: req.user._id
      });
    } else if (role === 'student') {
      let profile = await StudentProfile.findOne({ userId: existing._id, session: sessionId });

      if (profile) {
        // Merge sports if profile already exists
        profile.sports = Array.from(new Set([...(profile.sports || []), ...normalizedSports]));
        profile.name = name || profile.name;
        profile.branch = course || profile.branch;
        profile.year = year || profile.year;
        await profile.save();
      } else {
        // Create new profile
        console.log('Creating new student profile with sports:', normalizedSports);
        await StudentProfile.create({
          userId: existing._id,
          urn: rollNumber,
          name,
          branch: course || '',
          year: year || '',
          sports: normalizedSports,
          session: sessionId || null,
          personalDetails: {},
          isRegistered: false,
          lockedForUpdate: false
        });
      }
    }

    res.status(201).json({
      message: `${role} created/updated successfully`,
      ...(generatedCaptainId && { captainId: generatedCaptainId })
    });

  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
};



// GET PENDING STUDENT PROFILES
const getPendingProfiles = async (req, res) => {
  try {
    const students = await StudentProfile.find({
      isRegistered: false,
      lockedForUpdate: true
    })
      .populate('userId', 'email name')
      .populate('session', 'session')
      .lean();

    res.json(students.map(student => ({
      _id: student._id,
      name: student.name || '',
      email: student.userId?.email || '',
      urn: student.urn || '',
      branch: student.branch || '',
      year: student.year || '',
      sports: student.sports || [], // Now returns array
      session: student.session,
      dob: student.dob || '',
      gender: student.gender || '',
      address: student.address || '',
      phone: student.contact || ''
    })));
  } catch (err) {
    console.error('Error fetching pending profiles:', err);
    res.status(500).json({ error: 'Failed to fetch pending student profiles' });
  }
};


// APPROVE STUDENT PROFILE
const approveStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;

    const updated = await StudentProfile.findByIdAndUpdate(
      studentId,
      { isRegistered: true, lockedForUpdate: false },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json({ message: 'Student profile approved', student: updated });
  } catch (err) {
    console.error('Error approving student profile:', err);
    res.status(500).json({ error: 'Failed to approve student profile' });
  }
};

// REJECT STUDENT PROFILE
const rejectStudentProfile = async (req, res) => {
  try {
    const studentId = req.params.id;
    const rejectionMessage =
      req.body.message ||
      'Your profile submission was rejected. Please refill the details correctly.';

    const studentProfile = await StudentProfile.findById(studentId);

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Reset editable fields
    studentProfile.dob = null;
    studentProfile.gender = '';
    studentProfile.contact = '';
    studentProfile.address = '';
    studentProfile.sports = [];
    studentProfile.isRegistered = false;
    studentProfile.lockedForUpdate = false;

    // Add rejection notification
    studentProfile.notifications.push({
      type: 'rejection',
      message: rejectionMessage,
      read: false,
      createdAt: new Date()
    });

    await studentProfile.save();

    res.json({ message: 'Student profile rejected and reset for editing', status: 'rejected' });
  } catch (err) {
    console.error('Error rejecting student profile:', err);
    res.status(500).json({ error: 'Failed to reject student profile' });
  }
};

// GET PENDING TEAMS
const getPendingTeams = async (req, res) => {
  try {
    const pendingTeams = await TeamMember.find({ status: 'pending' })
      .populate('captainId', 'name email sport teamName')
      .populate('sessionId', 'session')
      .lean();

    res.json(pendingTeams);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending teams', error: err.message });
  }
};

// UPDATE TEAM STATUS
const updateTeamStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const team = await TeamMember.findByIdAndUpdate(
      req.params.teamId,
      { status },
      { new: true }
    )
      .populate('captainId', 'name email sport teamName')
      .populate('sessionId', 'session');

    if (!team) return res.status(404).json({ message: 'Team not found' });

    res.json({ message: `Team ${status}`, team });
  } catch (err) {
    res.status(500).json({ message: 'Error updating team status', error: err.message });
  }
};
const getAllUsers = async (req, res) => { try { const users = await User.find({}, 'name email role'); res.json(users); } catch (err) { res.status(500).json({ message: 'Failed to fetch users', error: err.message }); } };
module.exports = {
  createUser,
  getAllUsers,
  getPendingProfiles,
  approveStudentProfile,
  rejectStudentProfile,
  getPendingTeams,
  updateTeamStatus
};
