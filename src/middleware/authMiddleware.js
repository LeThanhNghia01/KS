// src/middleware/authMiddleware.js

export const checkUserAuth = (req, res, next) => {
  if (!req.session.user) {
      return res.status(401).json({
          isAuthenticated: false,
          message: 'Vui lòng đăng nhập',
          redirectUrl: '/LoginUser/LoginUser.html'
      });
  }
  next();
};

export const checkAdminAuth = (req, res, next) => {
  if (!req.session.admin || !req.session.admin.isLoggedIn) {
      return res.status(401).json({
          success: false,
          message: 'Vui lòng đăng nhập',
          redirectUrl: '/admin/login'
      });
  }
  next();
};

export const checkAuth = (req, res, next) => {
  if (req.path.includes('/admin')) {
      if (!req.session.admin || !req.session.admin.isLoggedIn) {
          return res.redirect('/LoginAdmin/LoginAdmin.html');
      }
  } else {
      if (!req.session.user) {
          return res.redirect('/LoginUser/LoginUser.html');
      }
  }
  next();
};