const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  console.log('📥 Incoming request to protected route');
  console.log('🔍 Cookies received:', req.cookies);

  const token = req.cookies?.token;

  if (!token) {
    console.warn('🚫 No JWT token found in cookies');
    return res.status(401).json({ message: 'Unauthorized - No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token successfully verified');
    console.log('🧑‍💻 Decoded token payload:', decoded);

    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(403).json({ message: 'Forbidden - Invalid token' });
  }
};

exports.isAdmin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' });
exports.isTeacher = (req, res, next) => req.user?.role === 'teacher' ? next() : res.status(403).json({ message: 'Teachers only' });
exports.isStudent = (req, res, next) => req.user?.role === 'student' ? next() : res.status(403).json({ message: 'Students only' });

