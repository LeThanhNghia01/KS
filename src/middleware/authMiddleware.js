// src/middleware/authMiddleware.js

const checkUserAuth = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }
        // Add user data to req object
        req.userData = req.session.user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Phiên đăng nhập không hợp lệ'
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
    req.userData = { ...req.session.admin, isAdmin: true };
    next();
};
  
const checkAuth = (req, res, next) => {
    // For API routes
    if (req.path.startsWith('/api/')) {
        if (req.path.includes('/admin')) {
            if (!req.session.admin || !req.session.admin.isLoggedIn) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập'
                });
            }
            req.userData = { ...req.session.admin, isAdmin: true };
        } else {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false, 
                    message: 'Vui lòng đăng nhập'
                });
            }
            req.userData = req.session.user;
        }
        return next();
    }
    
    // For page routes
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