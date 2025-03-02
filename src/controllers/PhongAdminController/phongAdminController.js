// Trong file phongAdminController.js
const db = require('../../config/database');
const path = require('path');
const fs = require('fs').promises;

class PhongAdminController {
    static async createRoom(req, res) {
        const { IDTinhTrang, IDLoai, Gia } = req.body;
        let uploadedFilePaths = [];

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
                `INSERT INTO Phong (IDTinhTrang, IDLoai, Gia, created_by, updated_by)
                 VALUES (?, ?, ?, ?, ?)`,
                [IDTinhTrang, IDLoai, Gia, created_by, created_by]
            );
            
            const roomId = result.insertId;
            
            // Handle multiple image uploads if present
            if (req.files) {
                let roomImages = [];
                
                // Kiểm tra nếu có một ảnh hoặc nhiều ảnh
                if (req.files.imagePhong) {
                    if (Array.isArray(req.files.imagePhong)) {
                        roomImages = req.files.imagePhong;
                    } else {
                        roomImages = [req.files.imagePhong];
                    }
                    
                    const uploadDir = path.join(__dirname, '../../public/uploads/rooms');
                    
                    // Create upload directory if it doesn't exist
                    try {
                        await fs.mkdir(uploadDir, { recursive: true });
                    } catch (err) {
                        console.error('Lỗi khi tạo thư mục upload:', err);
                    }
                    
                    // Xử lý từng ảnh và lưu vào database
                    for (const image of roomImages) {
                        const fileName = `room_${roomId}_${Date.now()}_${Math.floor(Math.random() * 1000)}${path.extname(image.name)}`;
                        const filePath = path.join(uploadDir, fileName);
                        uploadedFilePaths.push(filePath);
                        
                        await image.mv(filePath);
                        const imagePath = `/public/uploads/rooms/${fileName}`;
                        
                        // Insert image path into AnhPhong table
                        await db.execute(
                            `INSERT INTO AnhPhong (PhongID, DuongDan)
                             VALUES (?, ?)`,
                            [roomId, imagePath]
                        );
                    }
                }
            }

            // Fetch the images after inserting
            const [images] = await db.execute(
                `SELECT * FROM AnhPhong WHERE PhongID = ?`,
                [roomId]
            );

            return res.json({
                success: true,
                message: 'Thêm phòng thành công',
                data: {
                    PhongID: roomId,
                    IDTinhTrang,
                    IDLoai,
                    Gia,
                    created_by,
                    images: images
                }
            });

        } catch (error) {
            // Clean up uploaded files if there was an error
            for (const filePath of uploadedFilePaths) {
                try {
                    await fs.unlink(filePath);
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
            const { roomType, status, minPrice, maxPrice } = req.query;
            
            let query = `
                SELECT p.*, lp.TenLoai, ttp.TenTinhTrang, nv.Ten as TenNhanVien
                FROM Phong p
                LEFT JOIN LoaiPhong lp ON p.IDLoai = lp.IDLoai
                LEFT JOIN TinhTrangPhong ttp ON p.IDTinhTrang = ttp.IDTinhTrang
                LEFT JOIN NhanVien nv ON p.created_by = nv.NhanVienID
                WHERE p.is_deleted = FALSE
            `;
    
            const params = [];
    
            // Thêm điều kiện lọc theo loại phòng
            if (roomType) {
                query += ` AND p.IDLoai = ?`;
                params.push(roomType);
            }
    
            // Thêm điều kiện lọc theo tình trạng
            if (status) {
                query += ` AND p.IDTinhTrang = ?`;
                params.push(status);
            }
    
            // Thêm điều kiện lọc theo giá
            if (minPrice) {
                query += ` AND p.Gia >= ?`;
                params.push(minPrice);
            }
            if (maxPrice) {
                query += ` AND p.Gia <= ?`;
                params.push(maxPrice);
            }
    
            query += ` ORDER BY p.PhongID DESC`;
    
            const [rooms] = await db.execute(query, params);
            
            // Lấy ảnh đại diện cho mỗi phòng (ảnh đầu tiên)
            for (let room of rooms) {
                const [images] = await db.execute(
                    `SELECT * FROM AnhPhong WHERE PhongID = ? ORDER BY AnhPhongID ASC LIMIT 1`,
                    [room.PhongID]
                );
                
                room.ImagePhong = images.length > 0 ? images[0].DuongDan : null;
                
                // Lấy tổng số hình ảnh
                const [countResult] = await db.execute(
                    `SELECT COUNT(*) as totalImages FROM AnhPhong WHERE PhongID = ?`,
                    [room.PhongID]
                );
                
                room.totalImages = countResult[0].totalImages;
            }
    
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
            
            // Lấy tất cả ảnh của phòng
            const [images] = await db.execute(
                `SELECT * FROM AnhPhong WHERE PhongID = ? ORDER BY AnhPhongID ASC`,
                [roomId]
            );
            
            const roomData = rooms[0];
            roomData.images = images;
    
            return res.json({
                success: true,
                message: 'Lấy thông tin phòng thành công',
                data: roomData
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
        const { IDTinhTrang, IDLoai, Gia, deleteImageIds } = req.body;
        let uploadedFilePaths = [];
    
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
    
            // Update database - thông tin phòng
            await db.execute(
                `UPDATE Phong 
                 SET IDTinhTrang = ?, IDLoai = ?, Gia = ?, updated_by = ? 
                 WHERE PhongID = ?`,
                [IDTinhTrang, IDLoai, Gia, updated_by, roomId]
            );
    
            // Xóa ảnh nếu có yêu cầu
            if (deleteImageIds && deleteImageIds.length > 0) {
                let imageIdsArray = Array.isArray(deleteImageIds) ? deleteImageIds : [deleteImageIds];
                
                // Lấy đường dẫn của ảnh trước khi xóa
                const [imagesToDelete] = await db.execute(
                    `SELECT * FROM AnhPhong WHERE AnhPhongID IN (?)`,
                    [imageIdsArray]
                );
                
                // Xóa file ảnh
                for (const image of imagesToDelete) {
                    try {
                        const filePath = path.join(__dirname, '../../public', image.DuongDan.replace('/public', ''));
                        if (await fs.access(filePath).then(() => true).catch(() => false)) {
                            await fs.unlink(filePath);
                        }
                    } catch (err) {
                        console.error('Lỗi khi xóa ảnh:', err);
                    }
                }
                
                // Xóa bản ghi trong database
                await db.execute(
                    `DELETE FROM AnhPhong WHERE AnhPhongID IN (?)`,
                    [imageIdsArray]
                );
            }
    
            // Thêm ảnh mới nếu có
            if (req.files) {
                let roomImages = [];
                
                if (req.files.imagePhong) {
                    if (Array.isArray(req.files.imagePhong)) {
                        roomImages = req.files.imagePhong;
                    } else {
                        roomImages = [req.files.imagePhong];
                    }
                    
                    const uploadDir = path.join(__dirname, '../../public/uploads/rooms');
                    
                    // Create upload directory if it doesn't exist
                    try {
                        await fs.mkdir(uploadDir, { recursive: true });
                    } catch (err) {
                        console.error('Lỗi khi tạo thư mục upload:', err);
                    }
                    
                    // Xử lý từng ảnh và lưu vào database
                    for (const image of roomImages) {
                        const fileName = `room_${roomId}_${Date.now()}_${Math.floor(Math.random() * 1000)}${path.extname(image.name)}`;
                        const filePath = path.join(uploadDir, fileName);
                        uploadedFilePaths.push(filePath);
                        
                        await image.mv(filePath);
                        const imagePath = `/public/uploads/rooms/${fileName}`;
                        
                        // Insert image path into AnhPhong table
                        await db.execute(
                            `INSERT INTO AnhPhong (PhongID, DuongDan)
                             VALUES (?, ?)`,
                            [roomId, imagePath]
                        );
                    }
                }
            }
    
            // Lấy tất cả ảnh sau khi cập nhật
            const [images] = await db.execute(
                `SELECT * FROM AnhPhong WHERE PhongID = ? ORDER BY AnhPhongID ASC`,
                [roomId]
            );
    
            return res.json({
                success: true,
                message: 'Cập nhật phòng thành công',
                data: {
                    PhongID: roomId,
                    IDTinhTrang,
                    IDLoai,
                    Gia,
                    updated_by,
                    images: images
                }
            });
    
        } catch (error) {
            // Clean up uploaded files if there was an error
            for (const filePath of uploadedFilePaths) {
                try {
                    await fs.unlink(filePath);
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
    
    // Thêm phương thức mới để xóa một ảnh cụ thể
    static async deleteRoomImage(req, res) {
        const imageId = req.params.imageId;
        
        try {
            // Validate imageId
            if (!imageId || isNaN(imageId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID ảnh không hợp lệ'
                });
            }
            
            // Lấy thông tin ảnh
            const [images] = await db.execute(
                `SELECT * FROM AnhPhong WHERE AnhPhongID = ?`,
                [imageId]
            );
            
            if (images.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy ảnh'
                });
            }
            
            const image = images[0];
            
            // Xóa file ảnh
            try {
                const filePath = path.join(__dirname, '../../public', image.DuongDan.replace('/public', ''));
                if (await fs.access(filePath).then(() => true).catch(() => false)) {
                    await fs.unlink(filePath);
                }
            } catch (err) {
                console.error('Lỗi khi xóa file ảnh:', err);
            }
            
            // Xóa bản ghi trong database
            await db.execute(
                `DELETE FROM AnhPhong WHERE AnhPhongID = ?`,
                [imageId]
            );
            
            return res.json({
                success: true,
                message: 'Xóa ảnh thành công'
            });
            
        } catch (error) {
            console.error('Lỗi khi xóa ảnh phòng:', error);
            return res.status(500).json({
                success: false,
                message: 'Đã có lỗi xảy ra khi xóa ảnh phòng',
                error: error.message
            });
        }
    }
}

module.exports = PhongAdminController;