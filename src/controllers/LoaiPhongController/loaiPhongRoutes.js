//src/controller/LoaiPhongController/loaiPhongRoutes.js
const express = require('express');
const router = express.Router();
const LoaiPhongController = require('./loaiPhongController');

router.get('/list', LoaiPhongController.getAllLoaiPhong);
router.post('/create', LoaiPhongController.createLoaiPhong);
// Thêm các routes khác: update, delete...

module.exports = router;