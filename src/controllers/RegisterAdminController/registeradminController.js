// RegisterAdminController.js
const db = require('../../config/database');

const registerController = {
    // Lấy danh sách roles có level phù hợp
    getRoles: async (req, res) => {
        try {
            // Chỉ lấy roles có AccessLevel <= 3 (Admin trở xuống)
            const [roles] = await db.query(
                'SELECT * FROM Roles WHERE AccessLevel <= 3 ORDER BY AccessLevel DESC'
            );
            res.json(roles);
        } catch (error) {
            console.error('Lỗi lấy roles:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Đăng ký tài khoản mới
    registerAdmin: async (req, res) => {
        try {
            const { Ten, Email, SoDienThoai, DiaChi, RoleID, MatKhau } = req.body;

            // Kiểm tra role hợp lệ
            const [role] = await db.query(
                'SELECT * FROM Roles WHERE RoleID = ? AND AccessLevel <= 3',
                [RoleID]
            );

            if (role.length === 0) {
                return res.status(400).json({
                    message: 'Vai trò không hợp lệ'
                });
            }

            // Kiểm tra email đã tồn tại
            const [existingUser] = await db.query(
                'SELECT * FROM NhanVien WHERE Email = ?',
                [Email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({
                    message: 'Email đã được sử dụng'
                });
            }

            // Thêm nhân viên mới
            const [result] = await db.query(
                'INSERT INTO NhanVien (Ten, Email, SoDienThoai, DiaChi, RoleID, MatKhau) VALUES (?, ?, ?, ?, ?, ?)',
                [Ten, Email, SoDienThoai, DiaChi, RoleID, MatKhau]
            );

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                user: {
                    id: result.insertId,
                    ten: Ten,
                    email: Email
                }
            });

        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
};

module.exports = registerController;