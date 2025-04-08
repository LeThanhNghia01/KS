// src/controllers/DatPhongController/datPhongRoutes.js
const express = require('express');
const router = express.Router();
const datPhongController = require('./datPhongController');
const authMiddleware = require('../../middleware/authMiddleware');

// Áp dụng middleware xác thực cho tất cả các route
router.use(authMiddleware.checkAuth);
router.post('/', datPhongController.createBooking);
router.get('/user/:userId', datPhongController.getUserBookings);
router.put('/cancel/:bookingId', datPhongController.cancelBooking);

module.exports = router;