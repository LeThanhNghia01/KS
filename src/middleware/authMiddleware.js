// src/middleware/authMiddleware.js

const checkUserAuth = (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).json({
          isAuthenticated: false,
          message: 'Vui lòng đăng nhập',
          redirectUrl: '/LoginUser/LoginUser.html'
      });
  }
  next();
};

const checkAdminAuth = (req, res, next) => {
  if (!req.session.admin || !req.session.admin.isLoggedIn) {
      return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
          redirectUrl: '/admin/login'
      });
  }
  next();
};

// General auth check for frontend routes
const checkAuth = (req, res, next) => {
  // Check if the route is for admin
  if (req.path.includes('/admin')) {
      if (!req.session.admin || !req.session.admin.isLoggedIn) {
          return res.redirect('/LoginAdmin/LoginAdmin.html');
      }
  } 
  // Check if the route is for user
  else {
      if (!req.session.user) {
          return res.redirect('/LoginUser/LoginUser.html');
      }
  }
  next();
};

module.exports = {
  checkUserAuth,
  checkAdminAuth,
  checkAuth
};