// controllers/captainController.js
const TeamMember = require("../models/TeamMember");
const Session = require("../models/session");

exports.getCaptainTeam = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ isActive: true });
    if (!activeSession) return res.status(404).json({ message: "No active session" });

    const team = await TeamMember.find({
      captainId: req.user.id,
      sessionId: activeSession._id
    });

    res.json({ team, isFirstTime: team.length === 0, session: activeSession });
  } catch (err) {
    res.status(500).json({ message: "Error fetching team", error: err.message });
  }
};

exports.initialTeamCreate = async (req, res) => {
  try {
    const activeSession = await Session.findOne({ isActive: true });
    if (!activeSession) return res.status(404).json({ message: "No active session" });

    const members = req.body.members.map(m => ({
      ...m,
      captainId: req.user.id,
      sessionId: activeSession._id
    }));

    await TeamMember.insertMany(members);
    res.json({ message: "Initial team registered" });
  } catch (err) {
    res.status(500).json({ message: "Error creating team", error: err.message });
  }
};
