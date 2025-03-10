//src/controllers/TienNghiPhongController/tienNghiPhongController.js
const db=require('../../config/database');

class TienNghiPhongController {

    static async getAllTienNghi(req, res) {
        try {
            const [tienNghi] = await db.execute(
                `SELECT TienNghiID, TenTienNghi, MoTa, Icon 
                 FROM TienNghi 
                 WHERE is_deleted = FALSE
                 ORDER BY TenTienNghi DESC`
            );
            
            return res.json({
                success: true,
                data: tienNghi
            });
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tiện nghi:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi lấy danh sách tiện nghi',
                error: error.message
            });
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
    static async createTienNghi(req, res) {
        try {
            const { TenTienNghi, MoTa, Icon } = req.body;
            
            if (!TenTienNghi) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập tên tiện nghi'
                });
            }
            
            const [result] = await db.execute(
                `INSERT INTO TienNghi (TenTienNghi, MoTa, Icon)
                 VALUES (?, ?, ?)`,
                [TenTienNghi, MoTa || null, Icon || null]
            );
            
            return res.json({
                success: true,
                message: 'Thêm tiện nghi thành công',
                data: {
                    TienNghiID: result.insertId,
                    TenTienNghi,
                    MoTa,
                    Icon
                }
            });
        } catch (error) {
            console.error('Lỗi khi thêm tiện nghi:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi thêm tiện nghi',
                error: error.message
            });
        }
    }

    // Cập nhật tiện nghi phòng
    static async updateTienNghi(req, res) {
        try {
            const tienNghiId = req.params.id;
            const { TenTienNghi, MoTa, Icon } = req.body;
            
            if (!TenTienNghi) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập tên tiện nghi'
                });
            }
            
            const [result] = await db.execute(
                `UPDATE TienNghi 
                 SET TenTienNghi = ?, MoTa = ?, Icon = ?
                 WHERE TienNghiID = ? AND is_deleted = FALSE`,
                [TenTienNghi, MoTa || null, Icon || null, tienNghiId]
            );
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy tiện nghi'
                });
            }
            
            return res.json({
                success: true,
                message: 'Cập nhật tiện nghi thành công',
                data: {
                    TienNghiID: tienNghiId,
                    TenTienNghi,
                    MoTa,
                    Icon
                }
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật tiện nghi:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi cập nhật tiện nghi',
                error: error.message
            });
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