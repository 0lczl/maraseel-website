// Middleware to check if user is admin
function requireAdmin(req, res, next) {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.session.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  }
  
  module.exports = { requireAdmin };
  