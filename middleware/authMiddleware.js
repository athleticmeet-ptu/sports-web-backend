const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Forbidden' });
  }
};

exports.isAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' });
exports.isTeacher = (req, res, next) => req.user?.role === 'teacher' ? next() : res.status(403).json({ message: 'Teachers only' });
exports.isStudent = (req, res, next) => req.user?.role === 'student' ? next() : res.status(403).json({ message: 'Students only' });
