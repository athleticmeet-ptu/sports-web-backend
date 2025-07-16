const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true,  secure: true,       // 👈 required for cross-origin cookies
  sameSite: 'lax'}).json({
  message: 'Login successful',
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
});

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
