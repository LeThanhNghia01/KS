// src/controllers/PhongUserController/phongUserController.js
const db = require('../../config/database');


class PhongUserController {
    // Lấy tất cả phòng có trạng thái không bị xóa
    async getAllPhong(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 9;
            const offset = (page - 1) * limit;
            
            // Lấy tổng số phòng để tính số trang
            const [countResult] = await db.query(`
                SELECT COUNT(*) as total
                FROM Phong p
                WHERE p.is_deleted = 0
            `);
            const total = countResult[0].total;
            
            // Tính toán phân trang
            const lastPage = Math.ceil(total / limit);
            
            // Lấy danh sách phòng theo phân trang
            const [rooms] = await db.query(`
                SELECT p.PhongID, p.Gia, p.IDLoai, p.IDTinhTrang, 
                       lp.TenLoai, ttp.TenTinhTrang
                FROM Phong p
                JOIN LoaiPhong lp ON p.IDLoai = lp.IDLoai
                JOIN TinhTrangPhong ttp ON p.IDTinhTrang = ttp.IDTinhTrang
                WHERE p.is_deleted = 0
                LIMIT ? OFFSET ?
            `, [limit, offset]);
    
            // Lấy ảnh cho từng phòng
            for (let room of rooms) {
                const [images] = await db.query(
                    'SELECT DuongDan FROM AnhPhong WHERE PhongID = ?',
                    [room.PhongID]
                );
                room.anhPhong = images.map(img => img.DuongDan);
            }
    
            res.json({
                success: true,
                data: rooms,
                pagination: {
                    total,
                    perPage: limit,
                    currentPage: page,
                    lastPage
                }
            });
    
        } catch (error) {
            console.error('Error fetching rooms:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách phòng',
                error: error.message
            });
        }
    }
    

    // Lấy chi tiết của một phòng
    async getPhongDetail(req, res) {
        try {
            const phongId = req.params.id;
            
            // Lấy thông tin phòng
            const roomQuery = `
                SELECT p.PhongID, p.Gia, p.IDLoai, p.IDTinhTrang, 
                       lp.TenLoai, ttp.TenTinhTrang
                FROM Phong p
                JOIN LoaiPhong lp ON p.IDLoai = lp.IDLoai
                JOIN TinhTrangPhong ttp ON p.IDTinhTrang = ttp.IDTinhTrang
                WHERE p.PhongID = ? AND p.is_deleted = 0
            `;
            
            // Sử dụng db.query trực tiếp vì db đã là promise pool
            const [rooms] = await db.query(roomQuery, [phongId]);
            
            if (rooms.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy phòng'
                });
            }
            
            const room = rooms[0];
            
            // Lấy ảnh cho phòng
            const [images] = await db.query(
                'SELECT DuongDan FROM AnhPhong WHERE PhongID = ?',
                [phongId]
            );
            
            room.anhPhong = images.map(img => img.DuongDan);
            
            // Trả về kết quả
            res.json({
                success: true,
                data: room
            });
        } catch (error) {
            console.error('Error fetching room details:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy thông tin phòng',
                error: error.message
            });
        }
    }
    
    
    // Lấy tất cả loại phòng
    async getAllLoaiPhong(req, res) {
        try {
            const loaiPhong = await query('SELECT * FROM LoaiPhong ORDER BY IDLoai');
            
            res.json({
                success: true,
                data: loaiPhong
            });
        } catch (error) {
            console.error('Error fetching room types:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi lấy danh sách loại phòng',
                error: error.message
            });
        }
    }

    // Kiểm tra phòng có sẵn trong khoảng thời gian
    async checkRoomAvailability(req, res) {
        try {
            const { phongId, ngayNhan, ngayTra } = req.query;
            
            if (!phongId || !ngayNhan || !ngayTra) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu thông tin cần thiết'
                });
            }
            
            // Kiểm tra xem phòng có được đặt trong khoảng thời gian này không
            const bookingsQuery = `
                SELECT COUNT(*) as count
                FROM DatPhong
                WHERE PhongID = ?
                AND TrangThai IN ('pending', 'confirmed')
                AND NOT (NgayTraPhong < ? OR NgayNhanPhong > ?)
            `;
            
            const result = await query(bookingsQuery, [phongId, ngayNhan, ngayTra]);
            
            const isAvailable = result[0].count === 0;
            
            res.json({
                success: true,
                available: isAvailable
            });
        } catch (error) {
            console.error('Error checking room availability:', error);
            res.status(500).json({
                success: false,
                message: 'Đã xảy ra lỗi khi kiểm tra tình trạng phòng',
                error: error.message
            });
        }
    }
}

module.exports = new PhongUserController();