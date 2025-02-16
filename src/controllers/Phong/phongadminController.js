const db = require('../../config/database');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: './src/public/images/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const phongController = {
    // Lấy danh sách phòng với phân trang
    getAllPhong: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = 5;
            const offset = (page - 1) * pageSize;

            const [rows] = await db.query(`
                SELECT p.*, l.TenLoai, t.TenTinhTrang 
                FROM Phong p
                JOIN LoaiPhong l ON p.IDLoai = l.IDLoai
                JOIN TinhTrangPhong t ON p.IDTinhTrang = t.IDTinhTrang
                LIMIT ? OFFSET ?
            `, [pageSize, offset]);

            const [total] = await db.query('SELECT COUNT(*) as total FROM Phong');
            
            res.json({
                data: rows,
                pagination: {
                    page,
                    pageSize,
                    totalItems: total[0].total,
                    totalPages: Math.ceil(total[0].total / pageSize)
                }
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Tạo phòng mới
    createPhong: async (req, res) => {
        try {
            const { IDTinhTrang, IDLoai, Gia } = req.body;
            let ImagePhong = null;

            if (req.file) {
                ImagePhong = `/images/${req.file.filename}`;
            }

            const [result] = await db.query(
                'INSERT INTO Phong (IDTinhTrang, IDLoai, Gia, ImagePhong) VALUES (?, ?, ?, ?)',
                [IDTinhTrang, IDLoai, Gia, ImagePhong]
            );

            res.status(201).json({
                message: 'Thêm phòng thành công',
                id: result.insertId
            });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Xác nhận phòng
    confirmRoom: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Kiểm tra phòng tồn tại
            const [phong] = await db.query('SELECT * FROM Phong WHERE PhongID = ?', [id]);
            if (!phong.length) {
                return res.status(404).json({ message: 'Không tìm thấy phòng' });
            }

            // Kiểm tra trạng thái
            if (phong[0].IDTinhTrang !== 2) {
                return res.status(400).json({ 
                    message: 'Chỉ có thể xác nhận phòng đang ở trạng thái Chờ Xác Nhận' 
                });
            }

            // Cập nhật trạng thái
            await db.query('UPDATE Phong SET IDTinhTrang = 3 WHERE PhongID = ?', [id]);
            await db.query('UPDATE DatPhong SET IDTinhTrang = 3 WHERE PhongID = ?', [id]);

            res.json({ message: 'Xác nhận phòng thành công' });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Cập nhật phòng
    updatePhong: async (req, res) => {
        try {
            const { id } = req.params;
            const { IDTinhTrang, IDLoai, Gia } = req.body;
            let ImagePhong = null;

            if (req.file) {
                ImagePhong = `/images/${req.file.filename}`;
            }

            const updateQuery = ImagePhong 
                ? 'UPDATE Phong SET IDTinhTrang = ?, IDLoai = ?, Gia = ?, ImagePhong = ? WHERE PhongID = ?'
                : 'UPDATE Phong SET IDTinhTrang = ?, IDLoai = ?, Gia = ? WHERE PhongID = ?';

            const params = ImagePhong 
                ? [IDTinhTrang, IDLoai, Gia, ImagePhong, id]
                : [IDTinhTrang, IDLoai, Gia, id];

            await db.query(updateQuery, params);

            res.json({ message: 'Cập nhật phòng thành công' });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    },

    // Xóa phòng
    deletePhong: async (req, res) => {
        try {
            const { id } = req.params;

            // Kiểm tra đặt phòng
            const [bookings] = await db.query(
                'SELECT * FROM DatPhong WHERE PhongID = ? AND NgayTraPhong >= NOW()',
                [id]
            );

            if (bookings.length > 0) {
                return res.status(400).json({ 
                    message: 'Không thể xóa phòng này vì đang có đặt phòng' 
                });
            }

            // Xóa các bản ghi liên quan
            await db.query('DELETE FROM HoaDon WHERE PhongID = ?', [id]);
            await db.query('DELETE FROM DatPhong WHERE PhongID = ?', [id]);
            await db.query('DELETE FROM Phong WHERE PhongID = ?', [id]);

            res.json({ message: 'Xóa phòng thành công' });
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
};

module.exports = phongController;