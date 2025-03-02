// File: src/controllers/PhongAdminController/PhongAdminRoutes.js
const express = require('express');
const router = express.Router();
const PhongAdminController = require('./phongAdminController');

let fileUpload;
try {
    fileUpload = require('express-fileupload');// Import thư viện express-fileupload
} catch (error) {
    console.error('Không thể import thư viện express-fileupload:Please run: npm install express-fileupload', error);
    // Nếu không import được thư viện express-fileupload thì sử dụng middleware giả để không bị lỗi
    fileUpload = () => (req, res, next) => next();
}

const { checkAdminAuth } = require('../../middleware/authMiddleware');

// Middleware để xử lý upload file với xử lý lỗi
router.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    abortOnLimit: true,
    responseOnLimit: 'File size quá lớn (max 5MB)',
    useTempFiles: true,
    tempFileDir: '/tmp/',
    debug: process.env.NODE_ENV === 'development'
}));

// Middleware xử lý lỗi upload
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'File quá lớn, vui lòng chọn file nhỏ hơn 5MB'
        });
    }
    next(err);
});
// Trong PhongAdminRoutes.js
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Route thêm phòng mới với xử lý lỗi
router.post('/create', checkAdminAuth, async (req, res) => {
    try {
        await PhongAdminController.createRoom(req, res);// Gọi hàm tạo phòng từ controller
    } catch (error) {
        console.error('Lỗi khi tạo phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi tạo phòng',
            error: error.message
        });
    }
});
// Route lấy danh sách phòng
router.get('/list', checkAdminAuth, PhongAdminController.getListRooms); 
// Route lấy chi tiết phòng
router.get('/detail/:id', checkAdminAuth, PhongAdminController.getRoomDetail);
// Route cập nhật phòng
router.put('/update/:id', checkAdminAuth, async (req, res) => {
    try {
        await PhongAdminController.updateRooms(req, res);
    } catch (error) {
        console.error('Lỗi khi cập nhật phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi cập nhật phòng',
            error: error.message
        });
    }
});
// Route xóa phòng
router.delete('/delete/:id', checkAdminAuth, PhongAdminController.deleteRoom);

// Thêm route mới để xóa một ảnh cụ thể
router.delete('/delete-image/:imageId', checkAdminAuth, PhongAdminController.deleteRoomImage);

module.exports = router;