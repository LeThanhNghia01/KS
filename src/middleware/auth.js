// src/middleware/auth.js
const authMiddleware = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(401).json({ 
            message: 'Vui lòng đăng nhập',
            redirectUrl: '/admin/login'
        });
    }
    next();
};

module.exports = authMiddleware;