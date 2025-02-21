// File: src/controllers/PhongAdminController/PhongAdminRoutes.js
const express = require('express');
const router = express.Router();
const PhongAdminController = require('./phongAdminController');

let fileUpload;
try {
    fileUpload = require('express-fileupload');
} catch (error) {
    console.error('express-fileupload module not found. Please run: npm install express-fileupload');
    // Provide a simple middleware as fallback
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
    responseOnLimit: 'File size is too large (max 5MB)',
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

// Route thêm phòng mới với xử lý lỗi
router.post('/create', checkAdminAuth, async (req, res) => {
    try {
        await PhongAdminController.createRoom(req, res);
    } catch (error) {
        console.error('Lỗi khi tạo phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi tạo phòng',
            error: error.message
        });
    }
});
router.get('/list', checkAdminAuth, PhongAdminController.getListRooms);


router.get('/detail/:id', checkAdminAuth, PhongAdminController.getRoomDetail);
router.put('/update/:id', checkAdminAuth, async (req, res) => {
    try {
        await PhongAdminController.updateRoom(req, res);
    } catch (error) {
        console.error('Lỗi khi cập nhật phòng:', error);
        res.status(500).json({
            success: false,
            message: 'Đã có lỗi xảy ra khi cập nhật phòng',
            error: error.message
        });
    }
});
router.delete('/delete/:id', checkAdminAuth, PhongAdminController.deleteRoom);
module.exports = router;