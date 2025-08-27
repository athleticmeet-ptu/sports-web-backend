const express = require('express');
const router = express.Router();
const { login,setRole } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const User = require('../models/User'); // ✅ Import the User model

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    // id ko normalize karo
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token: no user id' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error in /me:', err.message);
    res.status(500).json({ message: 'Auth failed' });
  }
});

router.post("/set-role", verifyToken,setRole);
module.exports = router;
