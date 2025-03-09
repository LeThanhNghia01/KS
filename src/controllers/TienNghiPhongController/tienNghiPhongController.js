//src/controllers/TienNghiPhongController/tienNghiPhongController.js
const db=require('../../config/database');

class TienNghiPhongController {

    static async getAllTienNghi() {
        try {
            const query = "SELECT * FROM TienNghi WHERE is_deleted = FALSE OR is_deleted IS NULL";
            const [rows] = await db.query(query);
            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tiện nghi phòng:', error);
            return {
                success: false,
                message: 'Không thể lấy danh sách tiện nghi phòng'
            };
        }
    }

    static async getTienNghiById(id) {
        try {
            const query = "SELECT * FROM TienNghi WHERE TienNghiID = ? AND (is_deleted = FALSE OR is_deleted IS NULL)";
            const [rows] = await db.query(query, [id]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy tiện nghi'
                };
            }
            
            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('Lỗi khi lấy thông tin tiện nghi:', error);
            return {
                success: false,
                message: 'Không thể lấy thông tin tiện nghi'
            };
        }
    }

    // Tạo tiện nghi phòng
    static async createTienNghi(tenTienNghi, moTa, icon) {
        try {
            const query = "INSERT INTO TienNghi (TenTienNghi, MoTa, Icon) VALUES (?, ?, ?)";
            const [result] = await db.query(query, [tenTienNghi, moTa, icon]);

            return {
                success: true,
                message: 'Tạo tiện nghi thành công',
                id: result.insertId
            };
        } catch (error) {
            console.error('Lỗi khi tạo tiện nghi:', error);
            return {
                success: false,
                message: 'Không thể tạo tiện nghi'
            };
        }
    }

    // Cập nhật tiện nghi phòng
    static async updateTienNghi(id, tenTienNghi, moTa, icon) {
        try {
            const query = "UPDATE TienNghi SET TenTienNghi = ?, MoTa = ?, Icon = ? WHERE TienNghiID = ?";
            const [result] = await db.query(query, [tenTienNghi, moTa, icon, id]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy tiện nghi để cập nhật'
                };
            }

            return {
                success: true,
                message: 'Cập nhật tiện nghi thành công'
            };
        } catch (error) {
            console.error('Lỗi khi cập nhật tiện nghi:', error);
            return {
                success: false,
                message: 'Không thể cập nhật tiện nghi'
            };
        }
    }

    // Xóa tiện nghi phòng
    static async deleteTienNghi(id) {
        try {
            const query = "UPDATE TienNghi SET is_deleted = TRUE WHERE TienNghiID = ?";
            const [result] = await db.query(query, [id]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy tiện nghi để xóa'
                };
            }

            return {
                success: true,
                message: 'Xóa tiện nghi thành công'
            };
        } catch (error) {
            console.error('Lỗi khi xóa tiện nghi:', error);
            return {
                success: false,
                message: 'Không thể xóa tiện nghi'
            };
        }
    }
   
}

module.exports = TienNghiPhongController;