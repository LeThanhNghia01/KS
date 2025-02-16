//src/controllers/LoaiPhongController/loaiPhongConsole.js
const db=require('../../config/database');

class LoaiPhongConsole {
    // Lấy tất cả loại phòng
    static async getAllLoaiPhong() {
        try {
            const query = "SELECT * FROM LoaiPhong ORDER BY created_at DESC";
            const [rows] = await db.query(query);
            return {
                success: true,
                data: rows
            };
        } catch (error) {
            console.error('Lỗi khi lấy danh sách loại phòng:', error);
            return {
                success: false,
                message: 'Không thể lấy danh sách loại phòng'
            };
        }
    }

    // Thêm loại phòng mới
    static async createLoaiPhong(tenLoai) {
        try {
            // Kiểm tra tên loại phòng đã tồn tại chưa
            const [existing] = await db.query(
                "SELECT * FROM LoaiPhong WHERE TenLoai = ?",
                [tenLoai]
            );

            if (existing.length > 0) {
                return {
                    success: false,
                    message: 'Tên loại phòng đã tồn tại'
                };
            }

            const query = "INSERT INTO LoaiPhong (TenLoai) VALUES (?)";
            const [result] = await db.query(query, [tenLoai]);

            return {
                success: true,
                message: 'Thêm loại phòng thành công',
                data: {
                    id: result.insertId,
                    tenLoai: tenLoai
                }
            };
        } catch (error) {
            console.error('Lỗi khi thêm loại phòng:', error);
            return {
                success: false,
                message: 'Không thể thêm loại phòng'
            };
        }
    }

    // Cập nhật loại phòng
    static async updateLoaiPhong(id, tenLoai) {
        try {
            // Kiểm tra tên mới có trùng với loại phòng khác không
            const [existing] = await db.query(
                "SELECT * FROM LoaiPhong WHERE TenLoai = ? AND IDLoai != ?",
                [tenLoai, id]
            );

            if (existing.length > 0) {
                return {
                    success: false,
                    message: 'Tên loại phòng đã tồn tại'
                };
            }

            const query = "UPDATE LoaiPhong SET TenLoai = ? WHERE IDLoai = ?";
            const [result] = await db.query(query, [tenLoai, id]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy loại phòng để cập nhật'
                };
            }

            return {
                success: true,
                message: 'Cập nhật loại phòng thành công'
            };
        } catch (error) {
            console.error('Lỗi khi cập nhật loại phòng:', error);
            return {
                success: false,
                message: 'Không thể cập nhật loại phòng'
            };
        }
    }

    // Xóa loại phòng
    static async deleteLoaiPhong(id) {
        try {
            // Kiểm tra xem loại phòng có đang được sử dụng không
            const [phongUsing] = await db.query(
                "SELECT * FROM Phong WHERE IDLoai = ?",
                [id]
            );

            if (phongUsing.length > 0) {
                return {
                    success: false,
                    message: 'Không thể xóa vì loại phòng đang được sử dụng'
                };
            }

            const query = "DELETE FROM LoaiPhong WHERE IDLoai = ?";
            const [result] = await db.query(query, [id]);

            if (result.affectedRows === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy loại phòng để xóa'
                };
            }

            return {
                success: true,
                message: 'Xóa loại phòng thành công'
            };
        } catch (error) {
            console.error('Lỗi khi xóa loại phòng:', error);
            return {
                success: false,
                message: 'Không thể xóa loại phòng'
            };
        }
    }

    // Lấy thông tin chi tiết một loại phòng
    static async getLoaiPhongById(id) {
        try {
            const query = "SELECT * FROM LoaiPhong WHERE IDLoai = ?";
            const [rows] = await db.query(query, [id]);

            if (rows.length === 0) {
                return {
                    success: false,
                    message: 'Không tìm thấy loại phòng'
                };
            }

            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('Lỗi khi lấy thông tin loại phòng:', error);
            return {
                success: false,
                message: 'Không thể lấy thông tin loại phòng'
            };
        }
    }
}

module.exports = LoaiPhongConsole;