//src/controllers/LoginUserController/LoginUserController.js
const db = require('../../config/database');
const bcrypt = require('bcrypt');

const loginUserController = {
    login: async (req, res) => {
        try {
            const { email, matKhau } = req.body;

            const [users] = await db.execute(
                'SELECT * FROM NguoiDung WHERE Email = ? AND is_deleted = 0',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(matKhau, user.MatKhau);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }

            // Lưu thông tin user vào session
            req.session.user = {
                id: user.NguoiDungID,
                ten: user.TenNguoiDung,
                email: user.Email,
                role: 'user'
            };

            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                user: {
                    ten: user.TenNguoiDung,
                    email: user.Email
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },

    register: async (req, res) => {
        try {
            const { tenNguoiDung, email, soDienThoai, diaChi, matKhau } = req.body;

            // Kiểm tra email tồn tại
            const [existingUsers] = await db.execute(
                'SELECT * FROM NguoiDung WHERE Email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(matKhau, 10);

            // Thêm user mới
            const [result] = await db.execute(
                'INSERT INTO NguoiDung (TenNguoiDung, Email, SoDienThoai, DiaChi, MatKhau) VALUES (?, ?, ?, ?, ?)',
                [tenNguoiDung, email, soDienThoai, diaChi, hashedPassword]
            );

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                user: {
                    id: result.insertId,
                    ten: tenNguoiDung,
                    email: email
                }
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    },

    logout: async (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi server'
                });
            }
            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        });
    },

    checkAuth: async (req, res) => {
        try {
            if (req.session && req.session.user) {
                res.json({
                    isAuthenticated: true,
                    user: {
                        ten: req.session.user.ten,
                        email: req.session.user.email
                    }
                });
            } else {
                res.json({ isAuthenticated: false });
            }
        } catch (error) {
            console.error('Check auth error:', error);
            res.json({ isAuthenticated: false });
        }
    }
};

module.exports = loginUserController;