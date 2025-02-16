const db = require('../../config/database');

const profileController = {
    getProfileInfo: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập' });
            }

            const [nhanvien] = await db.query(
                `SELECT nv.*, r.RoleName 
                FROM NhanVien nv 
                JOIN Roles r ON nv.RoleID = r.RoleID 
                WHERE nv.NhanVienID = ?`,
                [req.session.admin.id]
            );

            if (nhanvien.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin' });
            }

            res.json(nhanvien[0]);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            if (!req.session.admin) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập' });
            }

            const { ten, soDienThoai, diaChi } = req.body;

            await db.query(
                'UPDATE NhanVien SET Ten = ?, SoDienThoai = ?, DiaChi = ? WHERE NhanVienID = ?',
                [ten, soDienThoai, diaChi, req.session.admin.id]
            );

            res.json({ 
                success: true,
                message: 'Cập nhật thông tin thành công' 
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
};

module.exports = profileController; 