//src/controllers/ProfileController/profileUserController.js
const db = require('../../config/database');
const path = require('path');

class ProfileUserController {
    static async getProfileUserInfo(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Vui lòng đăng nhập lại'
                });
            }

            const userId = req.session.user.NguoiDungID;
            const [userData] = await db.execute(
                'SELECT NguoiDungID, TenNguoiDung AS Ten, Email, SoDienThoai, DiaChi FROM NguoiDung WHERE NguoiDungID = ?',
                [userId]
            );

            if (userData.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thông tin người dùng'
                });
            }

            // Return user data directly without nested structure
            return res.json(userData[0]);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy thông tin người dùng'
            });
        }
    }

    static async updateProfileUser(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({message: 'Vui lòng đăng nhập lại'});
            }
            
            console.log('Headers:', req.headers);
            console.log('Body data received:', req.body);
            
            let { ten, soDienThoai, diaChi } = req.body;
            
            if (!ten || ten.trim() === '') {
                const [userData] = await db.query(
                    'SELECT TenNguoiDung FROM NguoiDung WHERE NguoiDungID = ?',
                    [req.session.user.NguoiDungID]
                );
                
                if (userData.length > 0) {
                    ten = userData[0].TenNguoiDung;
                } else {
                    return res.status(400).json({message: 'Không tìm thấy thông tin người dùng'});
                }
            }
            
            let queryParams = [ten, soDienThoai || null, diaChi || null, req.session.user.NguoiDungID];
            
            console.log('Final SQL query parameters:', queryParams);
            
            const [result] = await db.query(
                `UPDATE NguoiDung SET 
                TenNguoiDung = ?, 
                SoDienThoai = ?, 
                DiaChi = ?
                WHERE NguoiDungID = ?`,
                queryParams
            );
            
            console.log('Update result:', result);
            
            if (result.affectedRows > 0) {
                return res.json({
                    success: true,
                    message: 'Cập nhật thông tin thành công',
                    affectedRows: result.affectedRows
                });
            } else {
                return res.status(400).json({message: 'Không tìm thấy người dùng để cập nhật'});
            }
        } catch (error) {
            console.error('Chi tiết lỗi:', error);
            return res.status(500).json({message: 'Lỗi server: ' + error.message});
        }
    }
}

module.exports = ProfileUserController;