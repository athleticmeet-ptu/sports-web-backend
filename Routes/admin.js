const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Captain=require("../models/Captain")
const Certificate=require("../models/Certificate")
const TeamMember=require("../models/TeamMember")
const Session=require("../models/session")
const GymSwimmingStudent = require("../models/GymSwimmingStudent");
const {
  createUser,
  getAllUsers,
  getPendingProfiles,
  updateTeamStatus,
  getPendingTeams,
  rejectStudentProfile,
  approveStudentProfile,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  assignSportPosition,
  assignTeamPosition,
  getallStudents,
  getAllSports,
  getAllPositions,
  getAllSessions,
  getFilteredCaptains,
  getCaptainFilters,
  getEligibleCertificates
} = require('../controllers/adminController');
const { getAllCaptainsWithTeams } = require("../controllers/adminController");
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// User management
router.post('/create-user', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);

// Student profile approvals
router.get('/pending-profiles', verifyToken, isAdmin,getPendingProfiles);

// Approve student
router.put('/student/:id/approve', verifyToken, isAdmin,approveStudentProfile);

// Reject student
router.delete('/student/:id/reject', verifyToken, isAdmin,rejectStudentProfile);

// Team approvals
router.get('/pending-teams', verifyToken, isAdmin, getPendingTeams);
router.put('/team/:teamId/status', verifyToken, isAdmin, updateTeamStatus);
router.post("/assign-position", verifyToken, isAdmin, assignTeamPosition);
// ✅ Get all student profiles
router.get("/captains", getAllCaptainsWithTeams);
router.put("/captains/:id", async (req, res) => {
  try {
    const updatedCaptain = await Captain.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCaptain) return res.status(404).json({ message: "Captain not found" });
    res.json(updatedCaptain);
  } catch (err) {
    console.error("Error updating captain:", err);
    res.status(500).json({ message: "Server error updating captain" });
  }
});

// ✅ Delete a captain
router.delete("/captains/:id", async (req, res) => {
  try {
    const captain = await Captain.findByIdAndDelete(req.params.id);
    if (!captain) return res.status(404).json({ message: "Captain not found" });
    res.json({ message: "Captain deleted successfully" });
  } catch (err) {
    console.error("Error deleting captain:", err);
    res.status(500).json({ message: "Server error deleting captain" });
  }
});

// ✅ Delete a team member by index
router.delete("/captains/:id/members/:memberIndex", async (req, res) => {
  try {
    const { id, memberIndex } = req.params;
    const captain = await Captain.findById(id);

    if (!captain) return res.status(404).json({ message: "Captain not found" });
    if (memberIndex < 0 || memberIndex >= captain.teamMembers.length) {
      return res.status(400).json({ message: "Invalid member index" });
    }

    // Remove member
    captain.teamMembers.splice(memberIndex, 1);
    await captain.save();

    res.json(captain);
  } catch (err) {
    console.error("Error deleting team member:", err);
    res.status(500).json({ message: "Server error deleting team member" });
  }
});
router.get("/students", getAllStudents);

// GET single student by id
router.get("/student/:id", getStudentById);

// UPDATE student
router.put("/student/:id", updateStudent);

// DELETE student
router.delete("/student/:id", deleteStudent);

router.put("/students/:studentId/assign-sport-position", assignSportPosition);
router.get('/export', verifyToken, isAdmin, getallStudents);
router.get('/sports', verifyToken, isAdmin, getAllSports);
router.get("/sessions", verifyToken, isAdmin, getAllSessions);
router.get("/positions", verifyToken, isAdmin, getAllPositions);
router.post("/export-captains", verifyToken, isAdmin, getFilteredCaptains);
router.get("/captain-filters", verifyToken, isAdmin, getCaptainFilters);
router.get("/certificates", verifyToken, isAdmin, getEligibleCertificates);
// routes/admin.js


router.get("/again/captains", async (req, res) => {
  try {
    const activeSessions = await Session.find({ isActive: true })
      .select("_id session")
      .lean();

    const activeSessionIds = activeSessions.map(s => s._id.toString());

    const captains = await Captain.find({
      position: { $exists: true },
      session: { $in: activeSessionIds },
      certificateAvailable: false   // 👈 sirf pending wale
    }).lean();

    const sessionMap = {};
    activeSessions.forEach(s => {
      sessionMap[s._id.toString()] = s.session;
    });

    const formatted = captains.map(c => {
      const sessionId =
        typeof c.session === "object" && c.session?._id
          ? c.session._id.toString()
          : c.session?.toString();

      return {
        ...c,
        session: sessionId
          ? {
              _id: sessionId,
              name: sessionMap[sessionId] || null,
            }
          : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching captains" });
  }
});
router.get("/again/captains/sent", async (req, res) => {
  try {
    const sentCaptains = await Captain.find({
      certificateAvailable: true
    }).lean();

    res.json(sentCaptains);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching sent captains" });
  }
});





router.post("/certificates/send", async (req, res) => {
  try {
    // ids of students/captains jinko bhejna hai
    const { studentIds } = req.body;

    // Example: mark certificates as "sent"
    await Certificate.updateMany(
      { studentId: { $in: studentIds } },
      { $set: { isSent: true } }
    );

    res.json({ message: "Certificates sent to captains successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending certificates" });
  }
});
// List of captains with position allocated

router.get("/certificates/:captainId", async (req, res) => {
  try {
    const { captainId } = req.params;

    // 🔍 Captain details
    const captain = await Captain.findById(captainId).populate("session", "session");
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    const sessionId = captain.session?._id;
    if (!sessionId) {
      return res.status(400).json({ message: "Captain has no session" });
    }

    // 🔍 Team + members
    const team = await TeamMember.findOne({
      captainId: captain.captainId, // ⚠️ Captain model me captainId string hota hai
      sessionId,
    });
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ check if already certificates exist
    let certificates = await Certificate.find({ captainId, session: sessionId });

    if (certificates.length === 0) {
      const newCerts = [];

      // 🎖️ captain ka certificate
      newCerts.push({
        recipientType: "captain",
        captainId, // direct reference
        session: sessionId,
        sport: captain.sport,
        position: team.position || "Participant",
      });

      // 👥 members ke certificate
      if (team.members?.length) {
        team.members.forEach((m) => {
          newCerts.push({
            recipientType: "member",
            captainId, // captain se link
            session: sessionId,
            sport: m.sport || captain.sport,
            position: team.position || "Participant",
            memberInfo: {
              name: m.name,
              urn: m.urn,
              branch: m.branch,
              year: m.year,
              email: m.email,
              phone: m.phone,
            },
          });
        });
      }

      // Save all
      certificates = await Certificate.insertMany(newCerts);
    }

    // ✅ fetch with populate (captain + session)
    certificates = await Certificate.find({ captainId, session: sessionId })
      .populate("captainId", "name urn branch sport year")
      .populate("session", "session")
      .lean();

    res.json(certificates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating/fetching certificates" });
  }
});

router.post("/certificates/send/:captainId", async (req, res) => {
  try {
    const { captainId } = req.params;

    await Captain.findByIdAndUpdate(captainId, { certificateAvailable: true });

    res.json({ success: true, message: "Certificate marked as sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending certificate" });
  }
});


router.get("/students-unique", async (req, res) => {
  try {
    const profiles = await StudentProfile.find().lean();
    const teams = await TeamMember.find().lean();
    const captains = await Captain.find().lean();
    const gymSwim = await GymSwimmingStudent.find().lean();

    let merged = {};

    // 🟢 From StudentProfile
    (profiles || []).forEach(stu => {
      if (!stu?.urn) return; // skip if no URN

      if (!merged[stu.urn]) {
        merged[stu.urn] = {
          name: stu.name || "",
          urn: stu.urn,
          branch: stu.branch || "",
          year: stu.year || "",
          sports: [],
          positions: []
        };
      }

      if (Array.isArray(stu.sports)) {
        merged[stu.urn].sports.push(...stu.sports);
      }

      if (Array.isArray(stu.positions)) {
        stu.positions.forEach(pos => {
          if (pos?.sport) merged[stu.urn].sports.push(pos.sport);
          merged[stu.urn].positions.push(pos?.position || "pending");
        });
      }
    });

    // 🟢 From TeamMember
    (teams || []).forEach(team => {
      (team?.members || []).forEach(mem => {
        if (!mem?.urn) return;

        if (!merged[mem.urn]) {
          merged[mem.urn] = {
            name: mem.name || "",
            urn: mem.urn,
            branch: mem.branch || "",
            year: mem.year || "",
            sports: [],
            positions: []
          };
        }
        if (mem.sport) merged[mem.urn].sports.push(mem.sport);
        merged[mem.urn].positions.push(mem.position || "pending");
      });
    });

    // 🟢 From Captains
    (captains || []).forEach(cap => {
      if (!cap?.urn) return;

      if (!merged[cap.urn]) {
        merged[cap.urn] = {
          name: cap.name || "",
          urn: cap.urn,
          branch: cap.branch || "",
          year: cap.year || "",
          sports: [],
          positions: []
        };
      }
      if (cap.sport) merged[cap.urn].sports.push(cap.sport);
      merged[cap.urn].positions.push(cap.position || "pending");
    });

    // 🟢 From Gym/Swimming
    (gymSwim || []).forEach(gs => {
      if (!gs?.urn) return;

      if (!merged[gs.urn]) {
        merged[gs.urn] = {
          name: gs.name || "",
          urn: gs.urn,
          branch: gs.branch || "",
          year: gs.year || "",
          sports: [],
          positions: []
        };
      }
      if (gs.sport) merged[gs.urn].sports.push(gs.sport);
      merged[gs.urn].positions.push("pending"); // default
    });

    res.json(Object.values(merged));
  } catch (err) {
    console.error("❌ Error merging student data:", err);
    res.status(500).json({ message: "Error merging student data" });
  }
});

module.exports = router;
