const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/create-user', verifyToken, isAdmin, createUser);
router.get('/users', verifyToken, isAdmin, getAllUsers);

module.exports = router;
