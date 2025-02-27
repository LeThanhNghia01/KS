//src/controllers/ProfileController/profileUserController.js
const db = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const uploadDir = path.join(__dirname, '../../public/uploads/users');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'user-' + uniqueSuffix + ext);
    }
});

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const profileUserController = {
    getProfileUserInfo: async(req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({message: 'Vui lòng đăng nhập lại'});
            }
            
            const [nguoidung] = await db.query(
                `SELECT NguoiDungID, TenNguoiDung as Ten, DiaChi, SoDienThoai, Email, MatKhau, AnhDaiDien 
                FROM NguoiDung 
                WHERE NguoiDungID = ? AND is_deleted = FALSE`,
                [req.session.user.id]
            );
            
            if (nguoidung.length === 0) {
                return res.status(404).json({message: 'Không tìm thấy thông tin'});
            }
            
            res.json(nguoidung[0]);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({message: 'Lỗi server'});
        }
    },
    
    updateProfileUser: async(req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({message: 'Vui lòng đăng nhập lại'});
            }
            
            console.log('Dữ liệu nhận được:', req.body);
            
            // Lấy dữ liệu từ form
            let { ten, soDienThoai, diaChi, anhDaiDienCu } = req.body;
            
            // Nếu dữ liệu bị thiếu, lấy từ database
            if (!ten || ten.trim() === '') {
                const [userData] = await db.query(
                    'SELECT TenNguoiDung FROM NguoiDung WHERE NguoiDungID = ?',
                    [req.session.user.id]
                );
                
                if (userData.length > 0) {
                    ten = userData[0].TenNguoiDung;
                } else {
                    return res.status(400).json({message: 'Không tìm thấy thông tin người dùng'});
                }
            }
            
            // Chuẩn bị dữ liệu cập nhật
            let imageUpdateQuery = '';
            let queryParams = [ten, soDienThoai || '', diaChi || ''];
            
            // Xử lý ảnh đại diện
            if (req.file) {
                const imageUrl = `/uploads/users/${req.file.filename}`;
                imageUpdateQuery = ', AnhDaiDien = ?';
                queryParams.push(imageUrl);
                
                // Lấy ảnh cũ để xóa nếu có
                const [oldImage] = await db.query(
                    'SELECT AnhDaiDien FROM NguoiDung WHERE NguoiDungID = ?',
                    [req.session.user.id]
                );
                
                // Xóa ảnh cũ nếu tồn tại và không phải ảnh từ Google
                if (oldImage.length > 0 && oldImage[0].AnhDaiDien && !oldImage[0].AnhDaiDien.startsWith('http')) {
                    const oldImagePath = path.join(__dirname, '../../public', oldImage[0].AnhDaiDien);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            }
            
            // Thêm ID người dùng vào tham số
            queryParams.push(req.session.user.id);
            
            console.log('Tham số truy vấn SQL:', queryParams);
            
            await db.query(
                `UPDATE NguoiDung SET 
                TenNguoiDung = ?, 
                SoDienThoai = ?, 
                DiaChi = ?
                ${imageUpdateQuery}
                WHERE NguoiDungID = ?`,
                queryParams
            );
            
            res.json({message: 'Cập nhật thông tin thành công'});
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({message: 'Lỗi server: ' + error.message});
        }
    },
    
    // Middleware for handling the file upload
    uploadMiddleware: upload.single('anhDaiDien')
};

module.exports = profileUserController;