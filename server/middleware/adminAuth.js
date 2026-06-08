import { protect } from './auth.js';

export const requireAdmin = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      protect(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        requiredRole: 'admin',
        userRole: req.user.role
      });
    }

    console.log(`Admin access granted to: ${req.user.name}`);
    next();

  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

export const logAdminAction = (action) => {
  return (req, res, next) => {
    req.adminAction = {
      action,
      adminId: req.user?._id,
      adminName: req.user?.name,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    console.log(`Admin Action: ${action} by ${req.user?.name}`);
    next();
  };
};
