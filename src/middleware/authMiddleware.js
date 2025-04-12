const jwt = require('jsonwebtoken');

const checkUserAuth = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                isAuthenticated: false,
                message: 'Vui lòng đăng nhập',
                redirectUrl: '/LoginUser/LoginUser.html'
            });
        }

        // Thêm dữ liệu người dùng vào request
        req.user = req.session.user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            isAuthenticated: false,
            message: 'Phiên đăng nhập không hợp lệ',
            redirectUrl: '/LoginUser/LoginUser.html'
        });
    }
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
  
  const checkAuth = (req, res, next) => {
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
  
  module.exports = {
    checkUserAuth,
    checkAdminAuth,
    checkAuth
  };