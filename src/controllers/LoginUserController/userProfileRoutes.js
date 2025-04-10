const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { checkUserAuth } = require('../../middleware/authMiddleware');

router.get('/profile', checkUserAuth, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập lại'
            });
        }

        const [userData] = await db.query(
            `SELECT NguoiDungID, TenNguoiDung as Ten, DiaChi, SoDienThoai, Email 
             FROM NguoiDung 
             WHERE NguoiDungID = ? AND is_deleted = 0`,
            [req.session.user.id]
        );

        if (!userData || userData.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin người dùng'
            });
        }

        res.json({
            success: true,
            data: userData[0]
        });

    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy thông tin người dùng'
        });
    }
});

module.exports = router;