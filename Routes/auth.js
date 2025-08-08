const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User'); // ✅ Import the User model

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ user });
  } catch (err) {
    console.error('Error in /me:', err.message);
    res.status(500).json({ message: 'Auth failed' });
  }
});

module.exports = router;
