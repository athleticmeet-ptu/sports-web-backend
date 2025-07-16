const StudentProfile = require('../models/StudentProfile');

exports.getStudentProfile = async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user.id });
  res.json(profile);
};

exports.updateStudentProfile = async (req, res) => {
  const updated = await StudentProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true });
  res.json(updated);
};
