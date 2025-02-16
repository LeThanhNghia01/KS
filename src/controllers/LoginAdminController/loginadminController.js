// src/controllers/LoginAdminController/loginadminController.js
const db = require('../../config/database');
const loginController = {
    loginAdmin: async (req, res) => {
        try {
            // Log để debug
            console.log('Received login request:', req.body);

            const { email, password } = req.body;

            // QUAN TRỌNG: Đảm bảo đúng định dạng response
            res.setHeader('Content-Type', 'application/json');

            const [nhanvien] = await db.query(
                `SELECT nv.*, r.RoleName, r.AccessLevel 
                FROM NhanVien nv 
                JOIN Roles r ON nv.RoleID = r.RoleID 
                WHERE nv.Email = ?`,
                [email]
            );

            console.log('Query result:', nhanvien);

            if (nhanvien.length === 0 || password !== nhanvien[0].MatKhau) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Lưu session
            req.session.admin = {
                id: nhanvien[0].NhanVienID,
                email: nhanvien[0].Email,
                ten: nhanvien[0].Ten,
                role: nhanvien[0].RoleName,
                accessLevel: nhanvien[0].AccessLevel,
                isLoggedIn: true
            };

            // Đợi session được lưu
            await new Promise((resolve) => req.session.save(resolve));

            return res.json({
                success: true,
                message: 'Đăng nhập thành công',
                admin: req.session.admin
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error.message
            });
        }
    },

    checkAuth: async (req, res) => {
        try {
            if (req.session && req.session.admin && req.session.admin.isLoggedIn) {
                res.json({
                    isAuthenticated: true,
                    admin: req.session.admin, // Trả về toàn bộ thông tin admin
                    user: {  // Thêm object user để tương thích với frontend
                        ten: req.session.admin.ten,
                        email: req.session.admin.email,
                        role: req.session.admin.role
                    }
                });
            } else {
                res.json({ isAuthenticated: false });
            }
        } catch (error) {
            console.error('Check auth error:', error);
            res.json({ isAuthenticated: false });
        }
    },

    logout: async (req, res) => {
        try {
            console.log('Logout request received');
            console.log('Session before destroy:', req.session);

            if (!req.session) {
                console.log('No session found');
                return res.status(200).json({ message: 'Đã đăng xuất' });
            }

            // Clear session data
            req.session.admin = null;
            
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return res.status(500).json({ 
                        success: false,
                        message: 'Lỗi khi đăng xuất',
                        error: err.message
                    });
                }
                
                // Clear cookies
                res.clearCookie('connect.sid');
                
                console.log('Session destroyed successfully');
                res.status(200).json({ 
                    success: true,
                    message: 'Đăng xuất thành công' 
                });
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Lỗi server khi đăng xuất',
                error: error.message 
            });
        }
    }
};

module.exports = loginController;