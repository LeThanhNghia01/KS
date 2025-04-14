const db = require('../../config/database');

const profileUserController = {
    getProfileUserInfo: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập' });
            }

            // Sử dụng try-catch bổ sung để bắt lỗi khi truy vấn database
            try {
                const [nguoiDung] = await db.query(
                    'SELECT * FROM NguoiDung WHERE NguoiDungID = ?',
                    [req.session.user.id]
                );

                if (nguoiDung.length === 0) {
                    return res.status(404).json({ message: 'Không tìm thấy thông tin' });
                }

                res.json(nguoiDung[0]);
            } catch (dbError) {
                console.error('Database error:', dbError);
                res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi truy vấn cơ sở dữ liệu' });
            }
        } catch (error) {
            console.error('Error in getProfileUserInfo:', error);
            res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' });
        }
    },

    updateProfileUser: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ message: 'Vui lòng đăng nhập' });
            }

            // Lấy dữ liệu từ body request
            const { tenNguoiDung, soDienThoai, diaChi } = req.body;
            
            // Kiểm tra dữ liệu đầu vào
            if (!tenNguoiDung) {
                return res.status(400).json({ message: 'Tên người dùng không được để trống' });
            }

            // Cập nhật thông tin người dùng
            try {
                await db.query(
                    'UPDATE NguoiDung SET TenNguoiDung = ?, SoDienThoai = ?, DiaChi = ? WHERE NguoiDungID = ?',
                    [tenNguoiDung, soDienThoai, diaChi, req.session.user.id]
                );

                res.json({ 
                    success: true,
                    message: 'Cập nhật thông tin thành công' 
                });
            } catch (dbError) {
                console.error('Database error during update:', dbError);
                res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi cập nhật thông tin' });
            }
        } catch (error) {
            console.error('Error in updateProfileUser:', error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    }
};

module.exports = profileUserController;