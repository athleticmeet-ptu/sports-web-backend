const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed, role });
    await newUser.save();

    res.status(201).json({ message: `${role} created successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find({}, 'name email role');
  res.json(users);
};
