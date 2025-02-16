//src/controllers/AccountsAdminController/accountsAdminController.js
const db = require('../../config/database');
const bcrypt = require('bcrypt');

const accountsAdminController = {
    // Lấy danh sách admin
    getAllAdmins: async (req, res) => {
        try {
            const [admins] = await db.execute(`
                SELECT 
                    NhanVienID as id, 
                    Ten as ten, 
                    Email as email, 
                    created_at 
                FROM NhanVien 
                WHERE RoleID IN (
                    SELECT RoleID 
                    FROM Roles 
                    WHERE AccessLevel >= 3
                )`);
            res.json({ success: true, data: admins });
        } catch (error) {
            console.error('Error getting admins:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi server',
                error: error.message 
            });
        }
    },

    // Thêm admin mới
    addAdmin: async (req, res) => {
        try {
            const { ten, email, password } = req.body;

            // Kiểm tra email tồn tại
            const [existingAdmin] = await db.execute(
                'SELECT NhanVienID FROM NhanVien WHERE Email = ?', 
                [email]
            );
            
            if (existingAdmin.length > 0) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }

            // Lấy RoleID của Admin
            const [adminRole] = await db.execute(
                'SELECT RoleID FROM Roles WHERE RoleName = ?',
                ['Admin']
            );

            if (!adminRole.length) {
                return res.status(400).json({ message: 'Không tìm thấy Role Admin' });
            }

            // Thêm admin mới
            const query = `
                INSERT INTO NhanVien (Ten, Email, MatKhau, RoleID) 
                VALUES (?, ?, ?, ?)
            `;
            const [result] = await db.execute(query, [
                ten, 
                email, 
                password, // Nên hash password trước khi lưu
                adminRole[0].RoleID
            ]);

            res.json({ 
                message: 'Thêm admin thành công',
                adminId: result.insertId 
            });
        } catch (error) {
            console.error('Error adding admin:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Cập nhật admin
    updateAdmin: async (req, res) => {
        try {
            const { id, ten, email, password } = req.body;

            // Kiểm tra email tồn tại
            const [existingAdmin] = await db.execute(
                'SELECT NhanVienID FROM NhanVien WHERE Email = ? AND NhanVienID != ?', 
                [email, id]
            );
            
            if (existingAdmin.length > 0) {
                return res.status(400).json({ message: 'Email đã tồn tại' });
            }

            let query;
            let params;

            if (password) {
                query = 'UPDATE NhanVien SET Ten = ?, Email = ?, MatKhau = ? WHERE NhanVienID = ?';
                params = [ten, email, password, id];
            } else {
                query = 'UPDATE NhanVien SET Ten = ?, Email = ? WHERE NhanVienID = ?';
                params = [ten, email, id];
            }

            await db.execute(query, params);
            res.json({ message: 'Cập nhật thành công' });
        } catch (error) {
            console.error('Error updating admin:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Xóa admin
    deleteAdmin: async (req, res) => {
        try {
            const { id } = req.params;

            if (id === req.session.user.id) {
                return res.status(400).json({ 
                    message: 'Không thể xóa tài khoản đang đăng nhập' 
                });
            }

            await db.execute(
                'DELETE FROM NhanVien WHERE NhanVienID = ?', 
                [id]
            );

            res.json({ message: 'Xóa thành công' });
        } catch (error) {
            console.error('Error deleting admin:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
};

module.exports = accountsAdminController;