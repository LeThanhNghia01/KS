// src/controllers/DatPhongController/datPhongRoutes.js
const express = require('express');
const router = express.Router();
const datPhongController = require('./datPhongController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware.checkUserAuth);

// Create booking route
router.post('/', async (req, res) => {
    try {
        await datPhongController.createBooking(req, res);
    } catch (error) {
        console.error('Error in booking route:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xử lý đặt phòng',
            error: error.message
        });
    }
});

router.get('/user/:userId', datPhongController.getUserBookings);
router.put('/cancel/:bookingId', datPhongController.cancelBooking);

module.exports = router;