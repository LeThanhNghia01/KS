// File: src/controllers/PhongAdminController/phongAdminController.js
const db = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

class PhongAdminController {
    static async createRoom(req, res) {
        const { IDTinhTrang, IDLoai, Gia } = req.body;
        let imagePhong = null;
        let uploadedFilePath = null;

        try {
            // Validate input
            if (!IDTinhTrang || !IDLoai || !Gia) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
                });
            }

            // Validate price
            if (isNaN(Gia) || Gia <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Giá phòng không hợp lệ'
                });
            }

            // Handle image upload if present
            if (req.files && req.files.imagePhong) {
                const file = req.files.imagePhong;
                const fileName = `room_${Date.now()}${path.extname(file.name)}`;
                const uploadDir = path.join(__dirname, '../../public/uploads/rooms');
                
                // Create upload directory if it doesn't exist
                try {
                    await fs.mkdir(uploadDir, { recursive: true });
                } catch (err) {
                    console.error('Lỗi khi tạo thư mục upload:', err);
                }

                uploadedFilePath = path.join(uploadDir, fileName);
                await file.mv(uploadedFilePath);
                imagePhong = `/public/uploads/rooms/${fileName}`;
            }

            // Get creator info from session
            let created_by;
            if (req.session && req.session.admin && req.session.admin.NhanVienID) {
                created_by = req.session.admin.NhanVienID;
            } else {
                // Nếu không có session, thử lấy NhanVienID từ database dựa vào role admin
                const [admins] = await db.execute(
                    'SELECT NhanVienID FROM NhanVien WHERE RoleID = 1 LIMIT 1'
                );
                if (admins && admins.length > 0) {
                    created_by = admins[0].NhanVienID;
                } else {
                    throw new Error('Không tìm thấy thông tin admin trong hệ thống');
                }
            }

            // Insert into database
            const [result] = await db.execute(
                `INSERT INTO Phong (IDTinhTrang, IDLoai, Gia, ImagePhong, created_by, updated_by)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [IDTinhTrang, IDLoai, Gia, imagePhong, created_by, created_by]
            );

            return res.json({
                success: true,
                message: 'Thêm phòng thành công',
                data: {
                    PhongID: result.insertId,
                    IDTinhTrang,
                    IDLoai,
                    Gia,
                    ImagePhong: imagePhong,
                    created_by
                }
            });

        } catch (error) {
            // Clean up uploaded file if there was an error
            if (uploadedFilePath) {
                try {
                    await fs.unlink(uploadedFilePath);
                } catch (unlinkError) {
                    console.error('Lỗi khi xóa file tạm:', unlinkError);
                }
            }

            console.error('Lỗi khi thêm phòng:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi thêm phòng',
                error: error.message
            });
        }
    }
    static async getListRooms(req, res) {
        try {
            const query = `
                SELECT p.*, lp.TenLoai, ttp.TenTinhTrang, nv.Ten as TenNhanVien
                FROM Phong p
                LEFT JOIN LoaiPhong lp ON p.IDLoai = lp.IDLoai
                LEFT JOIN TinhTrangPhong ttp ON p.IDTinhTrang = ttp.IDTinhTrang
                LEFT JOIN NhanVien nv ON p.created_by = nv.NhanVienID
                WHERE p.is_deleted = FALSE
                ORDER BY p.PhongID DESC
            `;

            const [rooms] = await db.execute(query);

            return res.json({
                success: true,
                message: 'Lấy danh sách phòng thành công',
                data: rooms
            });

        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi lấy danh sách phòng',
                error: error.message
            });
        }
    }
    // Bổ sung vào PhongAdminController

static async getRoomDetail(req, res) {
    const roomId = req.params.id;

    try {
        // Validate roomId
        if (!roomId || isNaN(roomId)) {
            return res.status(400).json({
                success: false,
                message: 'ID phòng không hợp lệ'
            });
        }

        const [rooms] = await db.execute(
            `SELECT * FROM Phong WHERE PhongID = ? AND is_deleted = FALSE`,
            [roomId]
        );

        if (rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng'
            });
        }

        return res.json({
            success: true,
            message: 'Lấy thông tin phòng thành công',
            data: rooms[0]
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin phòng:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi lấy thông tin phòng',
            error: error.message
        });
    }
}

static async updateRoom(req, res) {
    const roomId = req.params.id;
    const { IDTinhTrang, IDLoai, Gia, currentImagePath } = req.body;
    let imagePhong = currentImagePath;
    let uploadedFilePath = null;

    try {
        // Validate input
        if (!roomId || isNaN(roomId) || !IDTinhTrang || !IDLoai || !Gia) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate price
        if (isNaN(Gia) || Gia <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá phòng không hợp lệ'
            });
        }

        // Check if room exists
        const [rooms] = await db.execute(
            `SELECT * FROM Phong WHERE PhongID = ? AND is_deleted = FALSE`,
            [roomId]
        );

        if (rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng'
            });
        }

        // Handle image upload if present
        if (req.files && req.files.imagePhong) {
            const file = req.files.imagePhong;
            const fileName = `room_${Date.now()}${path.extname(file.name)}`;
            const uploadDir = path.join(__dirname, '../../public/uploads/rooms');
            
            // Create upload directory if it doesn't exist
            try {
                await fs.mkdir(uploadDir, { recursive: true });
            } catch (err) {
                console.error('Lỗi khi tạo thư mục upload:', err);
            }

            uploadedFilePath = path.join(uploadDir, fileName);
            await file.mv(uploadedFilePath);
            
            // Delete old image if exists and is not a default image
            if (currentImagePath && !currentImagePath.includes('default') && fs.existsSync(path.join(__dirname, '../../public', currentImagePath.replace('/public', '')))) {
                try {
                    await fs.unlink(path.join(__dirname, '../../public', currentImagePath.replace('/public', '')));
                } catch (err) {
                    console.error('Lỗi khi xóa ảnh cũ:', err);
                }
            }
            
            imagePhong = `/public/uploads/rooms/${fileName}`;
        }

        // Get updater info from session
        let updated_by;
        if (req.session && req.session.admin && req.session.admin.NhanVienID) {
            updated_by = req.session.admin.NhanVienID;
        } else {
            // Nếu không có session, thử lấy NhanVienID từ database dựa vào role admin
            const [admins] = await db.execute(
                'SELECT NhanVienID FROM NhanVien WHERE RoleID = 1 LIMIT 1'
            );
            if (admins && admins.length > 0) {
                updated_by = admins[0].NhanVienID;
            } else {
                throw new Error('Không tìm thấy thông tin admin trong hệ thống');
            }
        }

        // Update database
        await db.execute(
            `UPDATE Phong 
             SET IDTinhTrang = ?, IDLoai = ?, Gia = ?, ImagePhong = ?, updated_by = ? 
             WHERE PhongID = ?`,
            [IDTinhTrang, IDLoai, Gia, imagePhong, updated_by, roomId]
        );

        return res.json({
            success: true,
            message: 'Cập nhật phòng thành công',
            data: {
                PhongID: roomId,
                IDTinhTrang,
                IDLoai,
                Gia,
                ImagePhong: imagePhong,
                updated_by
            }
        });

    } catch (error) {
        // Clean up uploaded file if there was an error
        if (uploadedFilePath) {
            try {
                await fs.unlink(uploadedFilePath);
            } catch (unlinkError) {
                console.error('Lỗi khi xóa file tạm:', unlinkError);
            }
        }

        console.error('Lỗi khi cập nhật phòng:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi cập nhật phòng',
            error: error.message
        });
    }
}

static async deleteRoom(req, res) {
    const roomId = req.params.id;

    try {
        // Validate roomId
        if (!roomId || isNaN(roomId)) {
            return res.status(400).json({
                success: false,
                message: 'ID phòng không hợp lệ'
            });
        }

        // Check if room exists
        const [rooms] = await db.execute(
            `SELECT * FROM Phong WHERE PhongID = ? AND is_deleted = FALSE`,
            [roomId]
        );

        if (rooms.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phòng'
            });
        }

        // Soft delete the room
        await db.execute(
            `UPDATE Phong SET is_deleted = TRUE WHERE PhongID = ?`,
            [roomId]
        );

        return res.json({
            success: true,
            message: 'Xóa phòng thành công'
        });

    } catch (error) {
        console.error('Lỗi khi xóa phòng:', error);
        return res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi xóa phòng',
            error: error.message
        });
    }
}
}

module.exports = PhongAdminController;