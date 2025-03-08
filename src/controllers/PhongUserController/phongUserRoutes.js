// src/controllers/PhongUserController/phongUserRoutes.js
const express = require('express');
const router = express.Router();
const phongUserController = require('./phongUserController');
// Đặt các route cụ thể trước route có tham số
router.get('/loai-phong', phongUserController.getAllLoaiPhong);
router.get('/check-availability', phongUserController.checkRoomAvailability);
// Đặt route có tham số ở cuối cùng
router.get('/', phongUserController.getAllPhong);
router.get('/:id', phongUserController.getPhongDetail);
module.exports = router;
